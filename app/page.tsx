"use client"

import {Button} from "@/components/ui/button";
import {ModeToggle} from "@/components/ui/themeToggle";
import {invoke} from '@tauri-apps/api/core';


export default function Home() {
    return (
        <div>
            <Button onClick={r => invoke('handle_sign_in')}>
                Login
            </Button>

            <Button onClick={r => invoke('get_auth_code').then(r => console.log(r))}>
                Get token
            </Button>

            <ModeToggle/>
        </div>
    );
}
