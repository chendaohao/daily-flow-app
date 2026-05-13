fn main() {
    println!("[DEBUG] main() called");
    println!("[DEBUG] Calling daily_flow_app_lib::run()...");
    daily_flow_app_lib::run();
    println!("[DEBUG] run() returned (should not reach here)");
}
