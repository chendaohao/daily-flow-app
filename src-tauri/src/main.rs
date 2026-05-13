fn main() {
    // 设置 panic hook，将错误显示为 Windows 消息框
    std::panic::set_hook(Box::new(|info| {
        let msg = if let Some(s) = info.payload().downcast_ref::<String>() {
            s.clone()
        } else if let Some(s) = info.payload().downcast_ref::<&str>() {
            s.to_string()
        } else {
            "Unknown error".to_string()
        };
        let location = info.location()
            .map(|l| format!(" at {}:{}", l.file(), l.line()))
            .unwrap_or_default();
        let full_msg = format!("Daily Flow 崩溃了:\n\n{}{}\n\n请将此信息反馈给开发者。", msg, location);
        eprintln!("{}", full_msg);

        #[cfg(target_os = "windows")]
        {
            use std::ffi::CString;
            let c_msg = CString::new(full_msg).unwrap_or_else(|_| CString::new("Error").unwrap());
            let c_title = CString::new("Daily Flow 崩溃").unwrap();
            unsafe {
                extern "system" {
                    fn MessageBoxA(hwnd: *const u8, lpText: *const i8, lpCaption: *const i8, uType: u32) -> i32;
                }
                MessageBoxA(std::ptr::null(), c_msg.as_ptr(), c_title.as_ptr(), 0x10);
            }
        }
    }));

    println!("[DEBUG] main() called");
    println!("[DEBUG] Calling daily_flow_app_lib::run()...");
    daily_flow_app_lib::run();
    println!("[DEBUG] run() returned normally");
}
