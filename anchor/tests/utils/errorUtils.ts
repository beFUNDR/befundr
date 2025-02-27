import { IS_BANKRUN_ENABLED } from "../bankrun/bankrunUtils"

/**
 * Generates a regular expression to match an "Account Not Found" error message for a given public key.
 *
 * @param {String} publicKey - The public key to include in the error message regex.
 * @returns {RegExp} A regular expression that matches the "Account Not Found" error message containing the given public key.
 */
export const getAccountNotFoundErrorRegex = (publicKey: String) => {
    return IS_BANKRUN_ENABLED ? new RegExp(`Could not find ${publicKey}`)
        : new RegExp(`Account does not exist or has no data ${publicKey}`)
}