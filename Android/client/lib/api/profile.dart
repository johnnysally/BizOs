import 'api_client.dart';

class ProfileApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> get() => _api.get('/client/profile');
  static Future<Response<dynamic>> update(Map<String, dynamic> data) =>
      _api.patch('/client/profile', data: data);
  static Future<Response<dynamic>> uploadLogo(FormData data) =>
      _api.dio.post('/client/profile/logo', data: data);
}
