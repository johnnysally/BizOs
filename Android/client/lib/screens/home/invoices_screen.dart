import 'package:bizos/services/api_service.dart';
import 'package:bizos/theme/app_theme.dart';
import 'package:flutter/material.dart';

class InvoicesScreen extends StatefulWidget {
  const InvoicesScreen({super.key});

  @override
  State<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends State<InvoicesScreen> {
  List<Map<String, dynamic>> _invoices = const [
    {
      'invoiceNumber': 'INV-1048',
      'customer': 'Kibichii Stores',
      'amountDue': 'KSh 24,500',
      'status': 'Pending',
      'dueDate': 'Due today',
    },
    {
      'invoiceNumber': 'INV-1032',
      'customer': 'Amina Njeri',
      'amountDue': 'KSh 8,400',
      'status': 'Paid',
      'dueDate': 'Paid',
    },
    {
      'invoiceNumber': 'INV-1023',
      'customer': 'Boma Pharmacy',
      'amountDue': 'KSh 16,250',
      'status': 'Overdue',
      'dueDate': '4 days late',
    },
  ];

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadInvoices();
  }

  Future<void> _loadInvoices() async {
    final items = await ApiService.instance.loadInvoices();
    if (!mounted) return;
    setState(() {
      _invoices = items;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(title: const Text('Invoices')),
      body: RefreshIndicator(
        onRefresh: _loadInvoices,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: _invoices.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final invoice = _invoices[index];
                  final status = invoice['status'] as String? ?? 'Pending';
                  final isPaid = status.toLowerCase() == 'paid';
                  final isOverdue = status.toLowerCase() == 'overdue';

                  return Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: isPaid
                                ? AppTheme.accent.withAlpha(24)
                                : isOverdue
                                ? Colors.red.withAlpha(22)
                                : Colors.orange.withAlpha(22),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            Icons.receipt_long_rounded,
                            color: isPaid
                                ? AppTheme.primaryDark
                                : isOverdue
                                ? Colors.red
                                : Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                invoice['invoiceNumber'] as String? ?? 'INV',
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                invoice['customer'] as String? ?? 'Customer',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: AppTheme.muted),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                invoice['dueDate'] as String? ?? '',
                                style: Theme.of(context).textTheme.bodySmall
                                    ?.copyWith(color: AppTheme.muted),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              invoice['amountDue'] as String? ?? 'KSh 0',
                              style: Theme.of(context).textTheme.titleSmall
                                  ?.copyWith(fontWeight: FontWeight.w700),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: isPaid
                                    ? AppTheme.accent.withAlpha(24)
                                    : isOverdue
                                    ? Colors.red.withAlpha(18)
                                    : Colors.orange.withAlpha(18),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                status,
                                style: TextStyle(
                                  color: isPaid
                                      ? AppTheme.primaryDark
                                      : isOverdue
                                      ? Colors.red.shade700
                                      : Colors.orange.shade700,
                                  fontWeight: FontWeight.w600,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
      ),
    );
  }
}
