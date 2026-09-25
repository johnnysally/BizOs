import 'package:flutter_dotenv/flutter_dotenv.dart';

const String kAppName = 'BizOs';
String get kApiBaseUrl =>
    dotenv.env['API_BASE_URL'] ??
    dotenv.env['VITE_API_URL'] ??
    const String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: 'http://localhost:5000/api',
    );
