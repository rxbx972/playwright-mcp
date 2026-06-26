export function replacePlaceholders(text, testData) {
  if (!text) return text;

  let result = text;
  result = result.replace(/{domain}/g, testData.domain);
  result = result.replace(/{test_users\.A\.id}/g, testData.test_users.A.id);
  result = result.replace(/{test_users\.A\.password}/g, testData.test_users.A.password);
  result = result.replace(/{test_users\.B\.id}/g, testData.test_users.B.id);
  result = result.replace(/{test_users\.B\.password}/g, testData.test_users.B.password);
  result = result.replace(/{test_users\.B\.name}/g, testData.test_users.B.name);
  result = result.replace(/{test_users\.B\.initial_password}/g, testData.test_users.B.initial_password);

  const inv = testData.invalid_test_data;
  result = result.replace(/{invalid_test_data\.wrong_names\.wrong_name_1}/g, inv.wrong_names.wrong_name_1);
  result = result.replace(/{invalid_test_data\.wrong_names\.wrong_name_2}/g, inv.wrong_names.wrong_name_2);
  result = result.replace(/{invalid_test_data\.wrong_names\.wrong_name_3}/g, inv.wrong_names.wrong_name_3);
  result = result.replace(/{invalid_test_data\.wrong_ids\.wrong_id_1}/g, inv.wrong_ids.wrong_id_1);
  result = result.replace(/{invalid_test_data\.wrong_ids\.wrong_id_2}/g, inv.wrong_ids.wrong_id_2);
  result = result.replace(/{invalid_test_data\.wrong_ids\.wrong_id_3}/g, inv.wrong_ids.wrong_id_3);

  const vm = testData.validation_messages;
  result = result.replace(/{validation_messages\.name_min_length}/g, vm.name_min_length);
  result = result.replace(/{validation_messages\.success_registration}/g, vm.success_registration);
  result = result.replace(/{validation_messages\.name_required}/g, vm.name_required);
  result = result.replace(/{validation_messages\.id_required}/g, vm.id_required);
  result = result.replace(/{validation_messages\.id_format}/g, vm.id_format);
  result = result.replace(/{validation_messages\.password_min_length}/g, vm.password_min_length);
  result = result.replace(/{validation_messages\.password_confirm_required}/g, vm.password_confirm_required);

  return result;
}

export function getLoginUrl(testData) {
  const base = testData.domain.replace(/\/$/, '');
  return `${base}/login`;
}
