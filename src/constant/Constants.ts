export const DIR_PATH_UPLOADED_IMAGE = `${__dirname}/temp/image/`;
export const RESPONSE_MESSAGE = {
    OK: {'msg':'ok'},
    SERVER_ERROR: {'msg':'server_error'},
    NON_FIELD: {'msg': 'non_filed_error'},
    UNABLE_CREDENTIAL: {'msg': 'unable_credential_errors'},
    DUPLICATED_EMAIL: {'msg': 'duplicated_email_error'},
    DUPLICATED_NAME: {'msg': 'duplicated_name_error'},
    NOT_AUTH: {'msg': 'not_authenticated_error'},
    NOT_FOUND: {'msg': 'not_found_error'},
    WRONG_INFO: {'msg': 'wrong_information_error'},
    WRONG_REQ: {'msg': 'wrong_request_error'},
    REG_NOT_FOUND: {'msg': 'region_not_found'}
};

export const DEFAULT_PATH = {
    INPUT : '/',
    OUTPUT : '/'
};