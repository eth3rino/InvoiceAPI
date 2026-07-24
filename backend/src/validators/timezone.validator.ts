import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { IANAZone } from 'luxon';

export function IsValidTimezone(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isValidTimezone',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any) {
                    return typeof value === 'string' && IANAZone.isValidZone(value);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid IANA timezone (e.g., America/Argentina/Buenos_Aires)`;
                },
            },
        });
    };
}