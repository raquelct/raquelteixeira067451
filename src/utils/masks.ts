/**
 * Utilitários para máscaras e formatação
 */

/**
 * Aplica máscara de CPF: 000.000.000-00
 * Aceita string ou number
 */
export const maskCPF = (value: string | number): string => {
    if (!value) return '';

    // Converte para string e remove não-dígitos
    const numbers = String(value).replace(/\D/g, '');

    // Aplica máscara progressiva
    return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1'); // Limita ao tamanho do CPF
};

/**
 * Aplica máscara de Telefone: (00) 00000-0000
 * Aceita string ou number
 */
export const maskPhone = (value: string | number): string => {
    if (!value) return '';

    const numbers = String(value).replace(/\D/g, '');

    // Limita a 11 dígitos
    const truncated = numbers.slice(0, 11);

    return truncated
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2');
};

/**
 * Remove formatação de CPF/Telefone (retorna apenas números em string)
 */
export const unmask = (value: string | number): string => {
    if (!value) return '';
    return String(value).replace(/\D/g, '');
};
