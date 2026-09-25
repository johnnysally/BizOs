import 'package:bizos/services/api_service.dart';
import 'package:bizos/theme/app_theme.dart';
import 'package:flutter/material.dart';

class CustomersScreen extends StatefulWidget {
  const CustomersScreen({super.key});

  @override
  State<CustomersScreen> createState() => _CustomersScreenState();
}

class _CustomersScreenState extends State<CustomersScreen> {
  List<Map<String, dynamic>> _customers = const [
    {
      'name': 'Amina Njeri',
      'segment': 'Retail',
      'spent': 'KSh 65,400',
      'status': 'Active',
    },
    {
      'name': 'Kibichii Stores',
      'segment': 'Wholesale',
      'spent': 'KSh 112,800',
      'status': 'Priority',
    },
    {
      'name': 'Boma Pharmacy',
      'segment': 'Healthcare',
      'spent': 'KSh 48,100',
      'status': 'Active',
    },
    {
      'name': 'Tamu Foods',
      'segment': 'Hospitality',
      'spent': 'KSh 78,200',
      'status': 'Needs follow-up',
    },
  ];

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadCustomers();
  }

  Future<void> _loadCustomers() async {
    final items = await ApiService.instance.loadCustomers();
    if (!mounted) return;
    setState(() {
      _customers = items.isNotEmpty ? items : _customers;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.bg,
      appBar: AppBar(
        title: const Text('Customers'),
        actions: [
          IconButton(
            onPressed: _loadCustomers,
            icon: const Icon(Icons.refresh_rounded),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadCustomers,
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: AppTheme.border),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Customer base',
                                style: Theme.of(context).textTheme.titleMedium
                                    ?.copyWith(fontWeight: FontWeight.w700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '${_customers.length} active customers',
                                style: Theme.of(context).textTheme.bodyMedium
                                    ?.copyWith(color: AppTheme.muted),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withAlpha(24),
                            borderRadius: BorderRadius.circular(999),
                          ),
                          child: Text(
                            '${_customers.where((c) => (c['status'] as String? ?? '').toLowerCase() != 'needs follow-up').length} active',
                            style: const TextStyle(
                              color: AppTheme.primary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  ..._customers.map((customer) {
                    final status = customer['status'] as String? ?? 'Active';
                    final isPriority = status == 'Priority';
                    final isFollowUp = status == 'Needs follow-up';

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
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
                              color: isPriority
                                  ? Colors.orange.withAlpha(24)
                                  : AppTheme.primary.withAlpha(24),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Icon(
                              Icons.person_rounded,
                              color: isPriority
                                  ? Colors.orange
                                  : AppTheme.primary,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  customer['name'] as String? ?? 'Customer',
                                  style: Theme.of(context).textTheme.titleMedium
                                      ?.copyWith(fontWeight: FontWeight.w700),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  customer['segment'] as String? ?? '',
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
                                customer['spent'] as String? ?? 'KSh 0',
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
                                  color: isFollowUp
                                      ? Colors.red.withAlpha(18)
                                      : isPriority
                                      ? Colors.orange.withAlpha(18)
                                      : AppTheme.accent.withAlpha(24),
                                  borderRadius: BorderRadius.circular(999),
                                ),
                                child: Text(
                                  status,
                                  style: TextStyle(
                                    color: isFollowUp
                                        ? Colors.red.shade700
                                        : isPriority
                                        ? Colors.orange.shade700
                                        : AppTheme.primaryDark,
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
                  }),
                ],
              ),
      ),
    );
  }
}
