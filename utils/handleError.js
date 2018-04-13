const USER_ERROR = 422;

const handleUserError = error => res => res.status(USER_ERROR).send({ error });

const handleNoPostError = handleUserError('Post unavailable');

const handleIDError = handleUserError('Invalid ID');

module.exports = { handleNoPostError, handleIDError };
