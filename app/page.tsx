"use client"

import {Button} from "@/components/ui/button";
import {ModeToggle} from "@/components/ui/themeToggle";

export default function Home() {
    return (
        <div>
            <Button onClick={r => console.log("s")}>
                Login
            </Button>

            <ModeToggle/>
        </div>
    );
}
