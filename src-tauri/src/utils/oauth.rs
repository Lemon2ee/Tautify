use rand::Rng;

pub fn generate_random_string(length: i32) -> String {
    const POSSIBLE: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let mut rng = rand::thread_rng();
    (0..length)
        .map(|_| {
            let idx = rng.gen_range(0..POSSIBLE.len());
            POSSIBLE[idx] as char
        })
        .collect()
}
