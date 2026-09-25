import 'package:bizos/screens/auth/login_screen.dart';
import 'package:bizos/screens/main_shell.dart';
import 'package:bizos/services/storage_service.dart';
import 'package:bizos/theme/app_theme.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/material.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');

  final hasSession = await StorageService.hasSession();

  runApp(BizOsApp(initialAuthenticated: hasSession));
}

class BizOsApp extends StatelessWidget {
  final bool initialAuthenticated;

  const BizOsApp({super.key, required this.initialAuthenticated});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BizOs',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme(),
      home: initialAuthenticated ? const MainShell() : const LoginScreen(),
    );
  }
}
