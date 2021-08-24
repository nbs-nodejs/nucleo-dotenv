import * as dotenv from "dotenv";
import path from "path";
import { Env } from "./env";

/**
 * @function [loadEnv]
 *
 * Load environment variables from file. Loading environment can be configured by setting env:
 *   - WORK_DIR: working directory, default to current working directory
 *   - ENV_FILE: custom filename, default to ".env"
 */
export function loadEnv(): void {
    // Get configuration
    const workDir = Env.getString("WORK_DIR", { defaultValue: "." });
    const envFile = Env.getString("ENV_FILE", { defaultValue: ".env" });

    // Load file
    dotenv.config({ path: path.join(workDir, envFile) });
}
