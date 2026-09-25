import 'api_client.dart';

class UsersApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> list({Map<String, dynamic>? query}) =>
      _api.get('/client/users', query: query);
  static Future<Response<dynamic>> get(String id) =>
      _api.get('/client/users/$id');
  static Future<Response<dynamic>> invite(Map<String, dynamic> data) =>
      _api.post('/client/users/invite', data: data);
  static Future<Response<dynamic>> deactivate(String id) =>
      _api.post('/client/users/$id/deactivate');
  static Future<Response<dynamic>> resetPassword(String id) =>
      _api.post('/client/users/$id/reset-password');
  static Future<Response<dynamic>> updateRole(
    String id,
    Map<String, dynamic> data,
  ) => _api.patch('/client/users/$id/role', data: data);
}
