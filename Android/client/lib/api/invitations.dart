import 'api_client.dart';

class InvitationsApi {
  static final _api = BizOsApiClient.instance;

  static Future<Response<dynamic>> list({Map<String, dynamic>? query}) =>
      _api.get('/client/invitations', query: query);
  static Future<Response<dynamic>> resend(String id) =>
      _api.post('/client/invitations/$id/resend');
  static Future<Response<dynamic>> cancel(String id) =>
      _api.delete('/client/invitations/$id');
}
