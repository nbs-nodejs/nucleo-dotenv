import { Parser } from "@nucleo-nodejs/data";
import { EnvError } from "./error";

export const Env = {
    getBoolean,
    getFloat,
    getInt,
    getString,
    getStringArray,
};

export enum ErrorCodeEnum {
    ENV_KEY_IS_REQUIRED = "E_ENV_1",
}

function getBoolean(key: string, options: { defaultValue?: boolean } = {}): boolean {
    try {
        return Parser.parseBoolean(process.env[key], options);
    } catch (err) {
        throw new EnvError(ErrorCodeEnum.ENV_KEY_IS_REQUIRED, `env ${key} is required`);
    }
}

function getFloat(key: string, options: { defaultValue?: number; optional?: boolean } = {}): number {
    try {
        return Parser.parseFloat(process.env[key], { defaultValue: options.defaultValue });
    } catch (err) {
        if (options.optional) {
            return options.defaultValue != null ? options.defaultValue : 0.0;
        }
        throw new EnvError(ErrorCodeEnum.ENV_KEY_IS_REQUIRED, `env ${key} is required`);
    }
}

function getInt(key: string, options: { defaultValue?: number; radix?: number; optional?: boolean } = {}): number {
    try {
        return Parser.parseInt(process.env[key], { defaultValue: options.defaultValue });
    } catch (err) {
        if (options.optional) {
            return options.defaultValue != null ? options.defaultValue : 0;
        }
        throw new EnvError(ErrorCodeEnum.ENV_KEY_IS_REQUIRED, `env ${key} is required`);
    }
}

function getString(key: string, options: { defaultValue?: string; optional?: boolean } = {}): string {
    try {
        const value = Parser.parseString(process.env[key], { defaultValue: options.defaultValue });
        if (!value) {
            throw new Error("value is empty");
        }
        return value;
    } catch (err) {
        if (options.optional) {
            return options.defaultValue != null ? options.defaultValue : "";
        }
        throw new EnvError(ErrorCodeEnum.ENV_KEY_IS_REQUIRED, `env ${key} is required`);
    }
}

function getStringArray(
    key: string,
    options: { defaultValue?: string[]; delimiter?: string; optional?: boolean } = {}
): string[] {
    try {
        return Parser.parseStringArray(process.env[key], { defaultValue: options.defaultValue });
    } catch (err) {
        if (options.optional) {
            return options.defaultValue != null ? options.defaultValue : [];
        }
        throw new EnvError(ErrorCodeEnum.ENV_KEY_IS_REQUIRED, `env ${key} is required`);
    }
}
