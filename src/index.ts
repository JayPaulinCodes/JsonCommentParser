import { readFileSync } from "fs";

export type Indexable<T> = { [index: string]: T };
export type DeepIndexable = Indexable<{ [index: string]: DeepIndexable }>;

export interface ParseOptions {
    eol?: "LF" | "CRLF";
}

export class JsonComment {
    private static readonly REGEX = {
        singleLine: /(\/\/.*(?:$|\n)|\/\*.*\*\/)/g,
        multiLine: {
            start: /\/\*.*/g,
            end: /.*\*\//g
        }
    }

    public static parse(jsonBody: string, options: ParseOptions): DeepIndexable {
        const eolConfig = options.eol ?? "LF";
        const eolChar = eolConfig === "CRLF" ? "\r\n" : "\n";

        const fileLines = jsonBody.toString().split(eolChar);
        const fileLinesFiltered: string[] = [];

        let inMultiLine = false;
        fileLines.forEach(elem => {
            if (inMultiLine) {
                // If we are in a multiline comment, see if it ends
                inMultiLine = elem.search(JsonComment.REGEX.multiLine.end) === -1;
                if (!inMultiLine) fileLinesFiltered.push(elem.replace(JsonComment.REGEX.multiLine.end, ""));
            } else {
                if (elem.search(JsonComment.REGEX.singleLine) !== -1) {
                    // Check if we have a single line comment
                    fileLinesFiltered.push(elem.replace(JsonComment.REGEX.singleLine, ""));
                } else if (elem.search(JsonComment.REGEX.multiLine.start) !== -1) {
                    // Check if we are starting a multi line comment
                    fileLinesFiltered.push(elem.replace(JsonComment.REGEX.multiLine.start, ""));
                    inMultiLine = true;
                } else {
                    // If the line doesn't have any comments
                    fileLinesFiltered.push(elem);
                }
            }
        });

        const rawFileBody = fileLinesFiltered.filter(elem => elem.trim() !== "").join(eolChar);
        const fileBody = JSON.parse(rawFileBody);

        return fileBody;
    }

    public static parsefromFile(filePath: string, options: ParseOptions): DeepIndexable {
        const fileContent = readFileSync(filePath);
        return JsonComment.parse(fileContent.toString(), options);
    }
}

export const parse = JsonComment.parse;
export const parsefromFile = JsonComment.parsefromFile;