use serde_json::Value;
use std::path::PathBuf;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::process::Command;

fn find_bridge_dir() -> PathBuf {
    // Try relative to executable (dev: src-tauri/target/debug/binary)
    if let Ok(exe) = std::env::current_exe() {
        let mut path = exe;
        path.pop(); // remove binary name
        path.pop(); // remove debug/release
        path.pop(); // remove target
        path.pop(); // remove src-tauri
        path.push("bridge");
        if path.join("bridge.ts").exists() {
            return path;
        }
    }

    // Try relative to current working directory
    let cwd_bridge = PathBuf::from("bridge");
    if cwd_bridge.join("bridge.ts").exists() {
        return std::fs::canonicalize(&cwd_bridge).unwrap_or(cwd_bridge);
    }

    // Try project root from CWD (sometimes CWD is src-tauri)
    let parent_bridge = PathBuf::from("../bridge");
    if parent_bridge.join("bridge.ts").exists() {
        return std::fs::canonicalize(&parent_bridge).unwrap_or(parent_bridge);
    }

    // Last resort
    PathBuf::from("bridge")
}

fn find_bun() -> String {
    if let Ok(home) = std::env::var("HOME") {
        let bun_path = format!("{}/.bun/bin/bun", home);
        if std::path::Path::new(&bun_path).exists() {
            return bun_path;
        }
    }
    "bun".to_string()
}

pub async fn call_bridge(command: &str, args: Value) -> Result<Value, String> {
    let bridge_dir = find_bridge_dir();
    let script = bridge_dir.join("bridge.ts");
    let bun = find_bun();

    if !script.exists() {
        return Err(format!(
            "Bridge script not found at {:?}. Bridge dir: {:?}, CWD: {:?}, EXE: {:?}",
            script,
            bridge_dir,
            std::env::current_dir().ok(),
            std::env::current_exe().ok()
        ));
    }

    let mut child = Command::new(&bun)
        .arg("run")
        .arg("bridge.ts")
        .current_dir(&bridge_dir)
        .stdin(std::process::Stdio::piped())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn bun: {}. Path: {}", e, bun))?;

    // Write request to stdin then close it
    {
        let stdin = child.stdin.as_mut().ok_or("Failed to get stdin")?;
        let request = serde_json::json!({
            "command": command,
            "args": args
        });
        let mut payload = serde_json::to_string(&request).map_err(|e| e.to_string())?;
        payload.push('\n');
        stdin
            .write_all(payload.as_bytes())
            .await
            .map_err(|e| format!("Failed to write to stdin: {}", e))?;
        stdin.flush().await.map_err(|e| format!("Failed to flush stdin: {}", e))?;
    }
    // Drop stdin to signal EOF
    child.stdin.take();

    let stdout = child.stdout.take().ok_or("Failed to get stdout")?;
    let mut reader = BufReader::new(stdout);
    let mut line = String::new();

    // Read lines until we find one that starts with '{' (skip log lines)
    let mut found_json = false;
    loop {
        line.clear();
        let read_result = tokio::time::timeout(
            std::time::Duration::from_secs(60),
            reader.read_line(&mut line),
        )
        .await
        .map_err(|_| "Bridge timed out after 60 seconds".to_string())?
        .map_err(|e| format!("Failed to read stdout: {}", e))?;

        if read_result == 0 {
            break;
        }

        let trimmed = line.trim();
        if trimmed.starts_with('{') {
            found_json = true;
            break;
        }
        // Skip non-JSON lines (ccusage log output)
    }

    if !found_json {
        // Collect stderr for diagnostics
        let mut stderr_output = String::new();
        if let Some(stderr) = child.stderr.take() {
            let mut err_reader = BufReader::new(stderr);
            let mut err_line = String::new();
            while err_reader.read_line(&mut err_line).await.unwrap_or(0) > 0 {
                stderr_output.push_str(&err_line);
                err_line.clear();
            }
        }
        let exit = child.wait().await.ok();
        return Err(format!(
            "Bridge produced no output. Exit: {:?}, stderr: {}",
            exit.map(|s| s.code()),
            stderr_output.trim()
        ));
    }

    let response: Value = serde_json::from_str(line.trim())
        .map_err(|e| format!("Failed to parse bridge response: {}. Raw: {}", e, line.trim()))?;

    if response.get("ok").and_then(|v| v.as_bool()) == Some(true) {
        Ok(response.get("data").cloned().unwrap_or(Value::Null))
    } else {
        let err_msg = response
            .get("error")
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown bridge error");
        Err(err_msg.to_string())
    }
}
