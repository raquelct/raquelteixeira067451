export const maskCPF = (value: string | number): string => {
    if (!value) return '';

    const numbers = String(value).replace(/\D/g, '');

    return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

export const maskPhone = (value: string | number): string => {
    if (!value) return '';

    const numbers = String(value).replace(/\D/g, '');
    const truncated = numbers.slice(0, 11);

    return truncated
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d)(\d{4})$/, '$1-$2');
};

export const unmask = (value: string | number): string => {
    if (!value) return '';
    return String(value).replace(/\D/g, '');
};
