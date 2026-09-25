import 'api_client.dart';

class ReportsApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> salesSummary({
    Map<String, dynamic>? query,
  }) => _api.get('/client/reports/sales', query: query);
  static Future<Response<dynamic>> topProducts({Map<String, dynamic>? query}) =>
      _api.get('/client/reports/top-products', query: query);
  static Future<Response<dynamic>> staff({Map<String, dynamic>? query}) =>
      _api.get('/client/reports/staff', query: query);
  static Future<Response<dynamic>> exportCsv({Map<String, dynamic>? query}) =>
      _api.get('/client/reports/export', query: query);
}
