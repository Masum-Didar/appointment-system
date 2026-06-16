function success(res, data = null, message = 'Success', statusCode = 200) {
  const response = {
    success: true,
    message,
    data,
  };

  if (data && data.meta) {
    response.meta = data.meta;
    delete data.meta;
  }

  return res.status(statusCode).json(response);
}

function paginated(res, data, total, page, limit) {
  return res.status(200).json({
    success: true,
    message: 'Success',
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

function created(res, data = null, message = 'Created successfully') {
  return res.status(201).json({
    success: true,
    message,
    data,
  });
}

function noContent(res) {
  return res.status(204).send();
}

function error(res, message = 'Internal server error', statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  return res.status(statusCode).json(response);
}

module.exports = {
  success,
  paginated,
  created,
  noContent,
  error,
};
