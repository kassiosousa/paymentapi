import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isCPF', async: false })
export class IsCPF implements ValidatorConstraintInterface {
    validate(cpf: string, args: ValidationArguments) {
        if (!cpf) return false;

        // Remove non-digits
        const cleanCPF = cpf.replace(/[^\d]+/g, '');

        if (cleanCPF.length !== 11) return false;

        // Check for all same digits
        if (/^(\d)\1+$/.test(cleanCPF)) return false;

        // Validate 1st digit
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
        }
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cleanCPF.charAt(9))) return false;

        // Validate 2nd digit
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
        }
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(cleanCPF.charAt(10))) return false;

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'CPF inválido';
    }
}
