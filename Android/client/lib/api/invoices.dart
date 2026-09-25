import 'api_client.dart';

class InvoicesApi {
  static final _api = BizOsApiClient.instance;

  static Future<List<Map<String, dynamic>>> list({
    Map<String, dynamic>? query,
  }) async => _api.list(await _api.get('/client/invoices', query: query));
  static Future<Response<dynamic>> get(String id) =>
      _api.get('/client/invoices/$id');
  static Future<Response<dynamic>> summary({Map<String, dynamic>? query}) =>
      _api.get('/client/invoices/summary', query: query);
}
