import 'api_client.dart';

class SiteApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> settings() =>
      _api.get('/public/site/settings');
  static Future<Response<dynamic>> businessTypes() =>
      _api.get('/public/site/business-types');
  static Future<Response<dynamic>> countries() =>
      _api.get('/public/site/countries');
  static Future<Response<dynamic>> currencies() =>
      _api.get('/public/site/currencies');
  static Future<Response<dynamic>> legalLinks() =>
      _api.get('/public/site/legal-links');
  static Future<Response<dynamic>> featureFlags() =>
      _api.get('/public/site/feature-flags');
  static Future<Response<dynamic>> plans() => _api.get('/public/site/plans');
}
