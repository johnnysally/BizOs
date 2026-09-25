import 'api_client.dart';

class SettingsApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> get() => _api.get('/client/settings');
  static Future<Response<dynamic>> update(Map<String, dynamic> data) =>
      _api.patch('/client/settings', data: data);
  static Future<Response<dynamic>> enablePayment(String code) =>
      _api.post('/client/settings/payments/$code/enable');
  static Future<Response<dynamic>> disablePayment(String code) =>
      _api.delete('/client/settings/payments/$code');
}
