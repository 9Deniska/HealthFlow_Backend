import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import * as dayjs from 'dayjs';

export function IsOldEnough(minAge: number, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOldEnough',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, _args: ValidationArguments) {
          const birthDate = dayjs(value);
          const now = dayjs();
          return birthDate.isValid() && now.diff(birthDate, 'year') >= minAge;
        },
        defaultMessage(): string {
          return `User must be at least ${minAge} years old`;
        },
      },
    });
  };
}
