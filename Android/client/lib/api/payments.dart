import 'api_client.dart';

class PaymentsApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> list({Map<String, dynamic>? query}) =>
      _api.get('/client/payments', query: query);
  static Future<Response<dynamic>> initiate(Map<String, dynamic> data) =>
      _api.post('/client/payments/initiate', data: data);
  static Future<Response<dynamic>> manual(Map<String, dynamic> data) =>
      _api.post('/client/payments/manual', data: data);
  static Future<Response<dynamic>> refund(
    String id, {
    Map<String, dynamic>? data,
  }) => _api.post('/client/payments/$id/refund', data: data);
}
