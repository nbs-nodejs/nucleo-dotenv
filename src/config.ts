import { readFile, writeFile, existsSync } from "fs";
import { promisify } from "util";
import { parse, stringify } from "envfile";
import { ByteEncoding, SecureGenerator, RandomStringOption } from "@nbsdev/nucleo-data";
import { v4 as uuidv4 } from "uuid";

const asyncReadFile = promisify(readFile);
const asyncWriteFile = promisify(writeFile);

export enum GeneratorMethodOption {
    JWT,
    RANDOM_STRING,
    UUID_V4,
    STATIC_STRING,
}

export interface GeneratorOption {
    key: string;
    type: GeneratorMethodOption;
    options?: unknown;
}

export const initConfig = async (
    options: {
        exampleFile?: string;
        outputFile?: string;
        generate?: GeneratorOption[];
    } = {}
): Promise<void> => {
    // Get output file
    let { outputFile } = options;
    if (!outputFile) {
        outputFile = ".env";
    }

    // Check if env file exists
    let envStr;
    if (existsSync(outputFile)) {
        envStr = await asyncReadFile(outputFile);
    } else {
        // Load example file
        let { exampleFile } = options;
        if (!exampleFile) {
            exampleFile = ".env-example";
        }

        // Load from example
        envStr = await asyncReadFile(exampleFile);
    }

    // Parse env file
    const env = parse(envStr.toString());

    // Generate secrets
    let { generate } = options;
    if (!generate) {
        generate = [];
    }
    generate.forEach((o) => {
        // Get key
        const { key } = o;

        // Generate value
        let value;
        switch (o.type) {
            case GeneratorMethodOption.JWT: {
                value = generateJwtSecret(o.options as GenerateJwtSecretOption);
                break;
            }
            case GeneratorMethodOption.RANDOM_STRING: {
                value = SecureGenerator.randomString(o.options as RandomStringOption);
                break;
            }
            case GeneratorMethodOption.UUID_V4: {
                value = uuidv4();
                break;
            }
            case GeneratorMethodOption.STATIC_STRING: {
                const tmp = o.options as StaticStringOption;
                value = tmp.value || "";
                break;
            }
            default: {
                return;
            }
        }

        // Set value
        env[key] = value;
    });

    // Write file
    return asyncWriteFile(outputFile, stringify(env));
};

export interface StaticStringOption {
    value?: string;
}

export interface GenerateJwtSecretOption {
    algo?: string;
    encoding?: ByteEncoding;
}

function generateJwtSecret(config: GenerateJwtSecretOption = {}) {
    let byteLen;
    switch (config.algo) {
        case "hs256": {
            byteLen = 32;
            break;
        }
        case "hs512":
        default: {
            // Set default to HS512
            config.algo = "hs512";
            byteLen = 129;
            break;
        }
    }

    return SecureGenerator.randomBytes({
        length: byteLen,
        encoding: config.encoding,
    });
}
