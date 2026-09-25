import 'package:bizos/services/api_service.dart';
import 'package:bizos/theme/app_theme.dart';
import 'package:flutter/material.dart';

class SalesScreen extends StatefulWidget {
  const SalesScreen({super.key});

  @override
  State<SalesScreen> createState() => _SalesScreenState();
}

class _SalesScreenState extends State<SalesScreen> {
  List<Map<String, dynamic>> _sales = const [
    {
      'customer': 'Amina Njeri',
      'amount': 'KSh 8,500',
      'status': 'Paid',
      'time': '09:20 AM',
    },
    {
      'customer': 'Kibichii Stores',
      'amount': 'KSh 14,200',
      'status': 'Pending',
      'time': '11:05 AM',
    },
    {
      'customer': 'Boma Pharmacy',
      'amount': 'KSh 6,400',
      'status': 'Paid',
      'time': '01:42 PM',
    },
    {
      'customer': 'Tamu Foods',
      'amount': 'KSh 22,800',
      'status': 'Pending',
      'time': '04:10 PM',
    },
  ];

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSales();
  }

  Future<void> _loadSales() async {
    final items = await ApiService.instance.loadSales();
    if (!mounted) return;
    setState(() {
      _sales = items.isNotEmpty ? items : _sales;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('Sales'),
        actions: [
          IconButton(
            onPressed: _loadSales,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadSales,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView.separated(
                padding: const EdgeInsets.all(20),
                itemCount: _sales.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final item = _sales[index];
                  final status = item['status'] as String? ?? 'Pending';
                  final isPaid = status == 'Paid';

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
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: isPaid
                                ? AppTheme.accent.withAlpha(24)
                                : Colors.orange.withAlpha(20),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: Icon(
                            Icons.receipt_long_rounded,
                            color: isPaid
                                ? AppTheme.primaryDark
                                : Colors.orange,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item['customer'] as String? ?? 'Customer',
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                item['time'] as String? ?? 'Today',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: AppTheme.muted),
                              ),
                            ],
                          ),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              item['amount'] as String? ?? 'KSh 0',
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
                                    ? AppTheme.accent.withAlpha(22)
                                    : Colors.orange.withAlpha(18),
                                borderRadius: BorderRadius.circular(999),
                              ),
                              child: Text(
                                status,
                                style: TextStyle(
                                  color: isPaid
                                      ? AppTheme.primaryDark
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
