// custom.d.ts (ou em um arquivo de declaração de tipos)
declare namespace Express {
    export interface Request {
        userid?: string; // Pode ser string ou qualquer tipo que você esteja usando para o userId
    }
}
