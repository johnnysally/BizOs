import 'api_client.dart';

class InsightsApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> today() =>
      _api.get('/client/insights/today');
  static Future<Response<dynamic>> range({Map<String, dynamic>? query}) =>
      _api.get('/client/insights/range', query: query);
  static Future<Response<dynamic>> stockAlerts() =>
      _api.get('/client/insights/stock-alerts');
  static Future<Response<dynamic>> chat(Map<String, dynamic> data) =>
      _api.post('/client/insights/chat', data: data);
}
