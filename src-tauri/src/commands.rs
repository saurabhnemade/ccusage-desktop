use crate::bridge::call_bridge;
use crate::cache::Cache;
use serde_json::Value;
use tauri::State;

fn cache_key(command: &str, args: &Value) -> String {
    format!("{}:{}", command, args)
}

async fn cached_bridge_call(
    cache: &Cache,
    command: &str,
    args: Value,
) -> Result<Value, String> {
    let key = cache_key(command, &args);

    if let Some(cached) = cache.get(&key) {
        return Ok(cached);
    }

    let result = call_bridge(command, args).await?;
    cache.set(key, result.clone());
    Ok(result)
}

#[tauri::command]
pub async fn get_daily_usage(
    cache: State<'_, Cache>,
    since: Option<String>,
    until: Option<String>,
    project: Option<String>,
) -> Result<Value, String> {
    let args = serde_json::json!({
        "since": since,
        "until": until,
        "project": project,
    });
    cached_bridge_call(&cache, "daily", args).await
}

#[tauri::command]
pub async fn get_weekly_usage(
    cache: State<'_, Cache>,
    since: Option<String>,
    until: Option<String>,
    project: Option<String>,
) -> Result<Value, String> {
    let args = serde_json::json!({
        "since": since,
        "until": until,
        "project": project,
    });
    cached_bridge_call(&cache, "weekly", args).await
}

#[tauri::command]
pub async fn get_monthly_usage(
    cache: State<'_, Cache>,
    since: Option<String>,
    until: Option<String>,
    project: Option<String>,
) -> Result<Value, String> {
    let args = serde_json::json!({
        "since": since,
        "until": until,
        "project": project,
    });
    cached_bridge_call(&cache, "monthly", args).await
}

#[tauri::command]
pub async fn get_session_usage(
    cache: State<'_, Cache>,
    since: Option<String>,
    until: Option<String>,
    project: Option<String>,
) -> Result<Value, String> {
    let args = serde_json::json!({
        "since": since,
        "until": until,
        "project": project,
    });
    cached_bridge_call(&cache, "session", args).await
}

#[tauri::command]
pub async fn get_session_blocks(
    cache: State<'_, Cache>,
    since: Option<String>,
    until: Option<String>,
    project: Option<String>,
) -> Result<Value, String> {
    let args = serde_json::json!({
        "since": since,
        "until": until,
        "project": project,
    });
    cached_bridge_call(&cache, "blocks", args).await
}

#[tauri::command]
pub async fn get_totals(
    cache: State<'_, Cache>,
    since: Option<String>,
    until: Option<String>,
    project: Option<String>,
    source: Option<String>,
) -> Result<Value, String> {
    let args = serde_json::json!({
        "since": since,
        "until": until,
        "project": project,
        "source": source.unwrap_or_else(|| "daily".to_string()),
    });
    cached_bridge_call(&cache, "totals", args).await
}

#[tauri::command]
pub async fn clear_cache(cache: State<'_, Cache>) -> Result<(), String> {
    cache.clear();
    Ok(())
}

#[tauri::command]
pub async fn debug_bridge() -> Result<Value, String> {
    let args = serde_json::json!({
        "since": null,
        "until": null,
        "project": null,
    });
    call_bridge("daily", args).await
}
