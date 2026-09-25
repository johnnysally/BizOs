import 'package:bizos/api/auth.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';

class RegistrationScreen extends StatefulWidget {
  const RegistrationScreen({super.key});

  @override
  State<RegistrationScreen> createState() => _RegistrationScreenState();
}

class _RegistrationScreenState extends State<RegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  final _businessNameController = TextEditingController();
  final _ownerNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _planIdController = TextEditingController(text: 'free');
  String _country = 'KE';
  String _businessType = 'retail';
  bool _agreed = false;
  bool _isSubmitting = false;
  String? _errorMessage;

  @override
  void dispose() {
    _businessNameController.dispose();
    _ownerNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    _planIdController.dispose();
    super.dispose();
  }

  String _errorText(Object error) {
    if (error is DioException) {
      final body = error.response?.data;
      if (body is Map) {
        final data = body['data'];
        if (data is Map && data['message'] is String) {
          return data['message'] as String;
        }
        if (body['message'] is String) return body['message'] as String;
        if (body['error'] is String) return body['error'] as String;
      }
      if (error.message != null && error.message!.isNotEmpty) {
        return error.message!;
      }
    }
    return error.toString().replaceFirst('Exception: ', '');
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_agreed) {
      setState(() => _errorMessage = 'Accept the terms to continue.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      await AuthApi.register({
        'businessName': _businessNameController.text.trim(),
        'ownerName': _ownerNameController.text.trim(),
        'email': _emailController.text.trim(),
        'phone': _phoneController.text.trim(),
        'country': _country,
        'businessType': _businessType,
        'password': _passwordController.text,
        'planId': _planIdController.text.trim(),
      });

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registration submitted successfully.')),
      );
      Navigator.of(context).pop();
    } catch (error) {
      if (!mounted) return;
      setState(() => _errorMessage = _errorText(error));
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xfff5f8fb),
      appBar: AppBar(title: const Text('Create your BizOs account')),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Register your business',
                          style: Theme.of(context).textTheme.headlineSmall
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Create an account to start managing your operations.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                        const SizedBox(height: 24),
                        _field(
                          _businessNameController,
                          'Business name',
                          Icons.storefront_rounded,
                        ),
                        const SizedBox(height: 14),
                        _field(
                          _ownerNameController,
                          'Your name',
                          Icons.person_outline_rounded,
                        ),
                        const SizedBox(height: 14),
                        _field(
                          _emailController,
                          'Email address',
                          Icons.email_outlined,
                          keyboardType: TextInputType.emailAddress,
                        ),
                        const SizedBox(height: 14),
                        _field(
                          _phoneController,
                          'Phone number',
                          Icons.phone_outlined,
                          required: false,
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 14),
                        DropdownButtonFormField<String>(
                          initialValue: _businessType,
                          decoration: const InputDecoration(
                            labelText: 'Business type',
                            prefixIcon: Icon(Icons.category_outlined),
                          ),
                          items: const [
                            DropdownMenuItem(
                              value: 'retail',
                              child: Text('Retail'),
                            ),
                            DropdownMenuItem(
                              value: 'restaurant',
                              child: Text('Restaurant'),
                            ),
                            DropdownMenuItem(
                              value: 'salon',
                              child: Text('Salon'),
                            ),
                            DropdownMenuItem(
                              value: 'pharmacy',
                              child: Text('Pharmacy'),
                            ),
                            DropdownMenuItem(
                              value: 'other',
                              child: Text('Other'),
                            ),
                          ],
                          onChanged: (value) =>
                              setState(() => _businessType = value ?? 'retail'),
                        ),
                        const SizedBox(height: 14),
                        DropdownButtonFormField<String>(
                          initialValue: _country,
                          decoration: const InputDecoration(
                            labelText: 'Country',
                            prefixIcon: Icon(Icons.public_rounded),
                          ),
                          items: const [
                            DropdownMenuItem(value: 'KE', child: Text('Kenya')),
                            DropdownMenuItem(
                              value: 'UG',
                              child: Text('Uganda'),
                            ),
                            DropdownMenuItem(
                              value: 'TZ',
                              child: Text('Tanzania'),
                            ),
                          ],
                          onChanged: (value) =>
                              setState(() => _country = value ?? 'KE'),
                        ),
                        const SizedBox(height: 14),
                        _field(
                          _passwordController,
                          'Password',
                          Icons.lock_outline_rounded,
                          obscureText: true,
                          validator: (value) {
                            if (value == null ||
                                value.length < 8 ||
                                !RegExp(r'[A-Za-z]').hasMatch(value) ||
                                !RegExp(r'\d').hasMatch(value)) {
                              return 'Use at least 8 characters, including a letter and number';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 14),
                        _field(
                          _planIdController,
                          'Plan ID',
                          Icons.workspace_premium_outlined,
                        ),
                        CheckboxListTile(
                          contentPadding: EdgeInsets.zero,
                          value: _agreed,
                          onChanged: (value) =>
                              setState(() => _agreed = value ?? false),
                          title: const Text(
                            'I agree to the BizOs terms and conditions',
                          ),
                          controlAffinity: ListTileControlAffinity.leading,
                        ),
                        if (_errorMessage != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.red.shade200),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.error_outline_rounded,
                                  color: Colors.red.shade700,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _errorMessage!,
                                    style: TextStyle(
                                      color: Colors.red.shade700,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                        const SizedBox(height: 18),
                        FilledButton.icon(
                          onPressed: _isSubmitting ? null : _submit,
                          icon: _isSubmitting
                              ? const SizedBox(
                                  width: 18,
                                  height: 18,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.person_add_alt_1_rounded),
                          label: Text(
                            _isSubmitting
                                ? 'Creating account...'
                                : 'Create account',
                          ),
                          style: FilledButton.styleFrom(
                            minimumSize: const Size.fromHeight(52),
                          ),
                        ),
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Already have an account? Sign in'),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _field(
    TextEditingController controller,
    String label,
    IconData icon, {
    bool required = true,
    bool obscureText = false,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      keyboardType: keyboardType,
      validator:
          validator ??
          (value) => required && (value == null || value.trim().isEmpty)
              ? '$label is required'
              : null,
      decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
    );
  }
}
