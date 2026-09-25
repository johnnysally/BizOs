import 'api_client.dart';

class LegalApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> get(String type) =>
      _api.get('/public/legal/$type');
}
