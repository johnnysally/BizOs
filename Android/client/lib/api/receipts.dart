import 'api_client.dart';

class ReceiptsApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> get(String saleId) =>
      _api.get('/client/receipts/$saleId');
  static Future<Response<dynamic>> pdf(String saleId) =>
      _api.get('/client/receipts/$saleId/pdf');
  static Future<Response<dynamic>> email(
    String saleId,
    Map<String, dynamic> data,
  ) => _api.post('/client/receipts/$saleId/email', data: data);
}
