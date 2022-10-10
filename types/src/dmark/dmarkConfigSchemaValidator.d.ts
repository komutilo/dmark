export type DmarkConfigSchemaValidatorOptions = {
    forceValidation: boolean | undefined;
};
/**
 * Validate the dmark config file schema.
 *
 * @param {import("./dmark").DmarkConfig} config The config object.
 * @param {DmarkConfigSchemaValidatorOptions | undefined} opts Validator options.
 * @returns {boolean} If the config is valid.
 * @throws {InvalidSchemaError} throws an error if the field is missing or mismatch a type.
 */
export function dmarkConfigSchemaValidator(config: import("./dmark").DmarkConfig, opts: DmarkConfigSchemaValidatorOptions | undefined): boolean;
//# sourceMappingURL=dmarkConfigSchemaValidator.d.ts.map