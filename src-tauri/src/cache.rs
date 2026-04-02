use serde_json::Value;
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

const TTL: Duration = Duration::from_secs(30);

struct CacheEntry {
    data: Value,
    inserted_at: Instant,
}

pub struct Cache {
    entries: Mutex<HashMap<String, CacheEntry>>,
}

impl Cache {
    pub fn new() -> Self {
        Cache {
            entries: Mutex::new(HashMap::new()),
        }
    }

    pub fn get(&self, key: &str) -> Option<Value> {
        let entries = self.entries.lock().ok()?;
        let entry = entries.get(key)?;
        if entry.inserted_at.elapsed() < TTL {
            Some(entry.data.clone())
        } else {
            None
        }
    }

    pub fn set(&self, key: String, data: Value) {
        if let Ok(mut entries) = self.entries.lock() {
            entries.insert(
                key,
                CacheEntry {
                    data,
                    inserted_at: Instant::now(),
                },
            );
        }
    }

    pub fn clear(&self) {
        if let Ok(mut entries) = self.entries.lock() {
            entries.clear();
        }
    }
}
