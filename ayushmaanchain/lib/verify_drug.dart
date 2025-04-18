// ignore_for_file: avoid_print
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:ayushmaanchain/service_provider/drug_nft_provider.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:web3dart/crypto.dart';

class VerifyDrug extends StatefulWidget {
  const VerifyDrug({super.key});

  @override
  State<VerifyDrug> createState() => _VerifyDrugState();
}

class _VerifyDrugState extends State<VerifyDrug> {
  String qrData = "";
  String tokenid = "";
  String stripid = "";
  final batchData = [];
  String backendUrl = dotenv.env["BACKEND_LINK"] ?? "https://default-link.com";

  bool? isValid;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final provider = Provider.of<DrugNftProvider>(context, listen: false);
      await provider.init();
      final args = ModalRoute.of(context)!.settings.arguments;
      if (args != null) {
        qrData = args as String;
        await fetchData();
      }
    });
  }

  Future<void> fetchData() async {
    final provider = Provider.of<DrugNftProvider>(context, listen: false);

    if (!provider.initialized) {
      print("Service not initialized yet");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Initializing... please wait a moment.")),
      );
      return;
    }

    final drug = provider.service;
    print("-------------QRDTA $qrData-------------");

    final parts = qrData.split("*&");
    if (parts.length != 2) {
      setState(() {
        isValid = false;
        isLoading = false;
      });
    }
    print("-------------PARTS $parts-------------");

    final tokenId = BigInt.parse(parts[0].trim());
    final stripId = parts[1].trim();

    setState(() {
      tokenid = tokenId.toString();
      stripid = stripId;
    });

    final batchData = await drug.getBatch(tokenId);
    final ipfsURL = batchData[0][1].toString().replaceAll(
      "ipfs://",
      "https://ipfs.io/ipfs/",
    );

    final response = await http.post(
      Uri.parse('$backendUrl/get-merkle-proof'),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({"ipfsURL": ipfsURL, "stripID": stripId}),
    );

    final data = jsonDecode(response.body);
    final List<dynamic> proof = data['proof'];

    final result = await drug.verifyStrip(
      tokenId,
      stripId,
      proof.map((e) => hexToBytes(e.toString())).toList(),
    );

    setState(() {
      isValid = result;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    qrData = ModalRoute.of(context)!.settings.arguments as String;

    return Scaffold(
      appBar: AppBar(
        title: const Text("Verify Drug"),
        backgroundColor: Colors.teal,
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child:
              isLoading
                  ? Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      CircularProgressIndicator(),
                      SizedBox(height: 20),
                      Text(
                        "Verifying medicine...",
                        style: TextStyle(fontSize: 18),
                      ),
                    ],
                  )
                  : Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Verification Result",
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (isValid == true) ...[
                        Icon(Icons.verified, color: Colors.green, size: 80),
                        const SizedBox(height: 10),
                        const Text(
                          "Medicine is ORIGINAL ✅",
                          style: TextStyle(
                            fontSize: 22,
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ] else ...[
                        Icon(Icons.warning, color: Colors.red, size: 80),
                        const SizedBox(height: 10),
                        const Text(
                          "Counterfeit Medicine ❌",
                          style: TextStyle(
                            fontSize: 22,
                            color: Colors.red,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                      const SizedBox(height: 40),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                        ),
                        onPressed: () {
                          Navigator.pushNamed(context, '/home');
                        },
                        child: const Text(
                          "Go to Home",
                          style: TextStyle(fontSize: 16),
                        ),
                      ),
                    ],
                  ),
        ),
      ),
    );
  }
}
