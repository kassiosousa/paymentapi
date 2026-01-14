import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'noSqlInjection', async: false })
export class NoSqlInjection implements ValidatorConstraintInterface {
    validate(text: string, args: ValidationArguments) {
        if (!text) return true;

        const sqlBlacklist = [
            /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
            /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
            /\w*((\%27)|(\'))(\s)*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
            /((\%27)|(\'))union/i,
            /exec(\s|\+)+(s|x)p\w+/i,
            /\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|DESCRIBE|USE)\b/i
        ];

        for (const pattern of sqlBlacklist) {
            if (pattern.test(text)) {
                return false;
            }
        }

        if (text.includes(';')) return false;

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Texto contém caracteres ou padrões não permitidos (potencial SQL Injection)';
    }
}
