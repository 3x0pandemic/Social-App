const isEmail = email => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regEx)) return true;
  else return false;
};

const isEmpty = string => {
  if (string.trim() === "") return true;
  else return false;
};

exports.validateSignupData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Must Not Be Empty";
  } else if (!isEmail(data.email)) {
    errors.email = "Must Be A Valid Email Address";
  }

  if (isEmpty(data.password)) errors.password = "Must Not Be Empty";
  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Passwords Must Match";
  if (isEmpty(data.handle)) errors.handle = "Must Not Be Empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = data => {
  let errors = {};

  if (isEmpty(user.email)) errors.email = "Must Not Be Empty";
  if (isEmpty(user.password)) errors.password = "Must Not Be Empty";

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};
