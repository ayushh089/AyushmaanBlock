import 'package:ayushmaanchain/context/auth_provider.dart';
import 'package:barcode_scan2/barcode_scan2.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class Home extends StatefulWidget {
  const Home({super.key});

  @override
  State<Home> createState() => _HomeState();
}

class _HomeState extends State<Home> {
  String qrCodeResult = "Scan a QR code";
  Future<void> scanQRCode() async {
    final result = await BarcodeScanner.scan();
    if (result.type == ResultType.Barcode) {
      setState(() {
        qrCodeResult = result.rawContent;
      });
    } else if (result.type == ResultType.Error) {
      setState(() {
        qrCodeResult = "Error";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    // final userData = Provider.of<AuthProvider>(context);
    final userData = Provider.of<AuthProvider>(context);
    return Scaffold(
      appBar: AppBar(title: const Text("Home")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text("Welcome to the Home Pagea! ${userData.name}---"),
            Text("Wallet Address: ${userData.walletAddress}"),
            Text("Role: ${userData.role}"),

            ElevatedButton(
              onPressed: scanQRCode,
              child: const Text("Scan QR Code"),
            ),
            Text(qrCodeResult, style: const TextStyle(fontSize: 20)),
            TextButton(
              onPressed: () {
                Navigator.pushReplacementNamed(context, '/login');
              },
              child: Text("Logout"),
            ),
          ],
        ),
      ),
    );
  }
}
