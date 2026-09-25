import 'api_client.dart';

class AuthApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> register(Map<String, dynamic> data) =>
      _api.post('/public/auth/register', data: data);
  static Future<Response<dynamic>> login(Map<String, dynamic> data) =>
      _api.post('/public/auth/login', data: data);
  static Future<Response<dynamic>> refresh(Map<String, dynamic> data) =>
      _api.post('/public/auth/refresh', data: data);
  static Future<Response<dynamic>> forgotPassword(Map<String, dynamic> data) =>
      _api.post('/public/auth/forgot-password', data: data);
  static Future<Response<dynamic>> resetPassword(Map<String, dynamic> data) =>
      _api.post('/public/auth/reset-password', data: data);
  static Future<Response<dynamic>> acceptInvite(Map<String, dynamic> data) =>
      _api.post('/public/auth/accept-invite', data: data);
  static Future<Response<dynamic>> logout() => _api.post('/client/auth/logout');
  static Future<Response<dynamic>> changePassword(Map<String, dynamic> data) =>
      _api.post('/client/auth/change-password', data: data);
  static Future<Response<dynamic>> me() => _api.get('/client/auth/me');
}
