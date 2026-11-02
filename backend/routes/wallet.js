const express = require("express");
const mongoose = require("mongoose");
const crypto = require("crypto");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Notification = require("../models/Notification");
const BankAccount = require("../models/BankAccount");
const { encryptBankValue, decryptBankValue } = require("../utils/bankAccountCrypto");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/bank-accounts", async (req, res, next) => {
  try {
    const accounts = await BankAccount.find({ owner: req.user._id })
      .select("+accountNameEncrypted +accountNumberLast4")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      accounts: accounts.map(account => ({
        id: account._id,
        bankName: account.bankName,
        accountName: decryptBankValue(account.accountNameEncrypted),
        last4: decryptBankValue(account.accountNumberLast4),
        createdAt: account.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.post("/bank-accounts", async (req, res, next) => {
  try {
    const bankName = typeof req.body.bankName === "string" ? req.body.bankName.trim() : "";
    const accountName = typeof req.body.accountName === "string" ? req.body.accountName.trim() : "";
    const accountNumber = typeof req.body.accountNumber === "string" ? req.body.accountNumber.trim() : "";

    if (!bankName || bankName.length > 100 || accountName.length < 3 || accountName.length > 100 || !/^\d{10}$/.test(accountNumber)) {
      return res.status(400).json({
        success: false,
        message: "Provide a bank name, account holder name, and valid 10-digit account number."
      });
    }

    const existing = await BankAccount.find({ owner: req.user._id })
      .select("+accountNameEncrypted +accountNumberEncrypted +accountNumberLast4");
    const duplicate = existing.some(account =>
      account.bankName === bankName &&
      decryptBankValue(account.accountNumberEncrypted) === accountNumber
    );

    if (duplicate) {
      return res.status(409).json({ success: false, message: "This bank account is already saved." });
    }

    const account = await BankAccount.create({
      owner: req.user._id,
      bankName,
      accountNameEncrypted: encryptBankValue(accountName),
      accountNumberEncrypted: encryptBankValue(accountNumber),
      accountNumberLast4: encryptBankValue(accountNumber.slice(-4))
    });

    res.status(201).json({
      success: true,
      account: {
        id: account._id,
        bankName: account.bankName,
        accountName,
        last4: accountNumber.slice(-4),
        createdAt: account.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/bank-accounts/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid bank account ID." });
    }

    const bankName = typeof req.body.bankName === "string" ? req.body.bankName.trim() : "";
    const accountName = typeof req.body.accountName === "string" ? req.body.accountName.trim() : "";
    const accountNumber = typeof req.body.accountNumber === "string" ? req.body.accountNumber.trim() : "";
    if (!bankName || bankName.length > 100 || accountName.length < 3 || accountName.length > 100 || !/^\d{10}$/.test(accountNumber)) {
      return res.status(400).json({ success: false, message: "Provide valid bank account details." });
    }

    const account = await BankAccount.findOne({ _id: req.params.id, owner: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: "Bank account not found." });

    account.bankName = bankName;
    account.accountNameEncrypted = encryptBankValue(accountName);
    account.accountNumberEncrypted = encryptBankValue(accountNumber);
    account.accountNumberLast4 = encryptBankValue(accountNumber.slice(-4));
    await account.save();

    res.json({
      success: true,
      account: { id: account._id, bankName, accountName, last4: accountNumber.slice(-4) }
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/bank-accounts/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid bank account ID." });
    }

    const account = await BankAccount.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!account) return res.status(404).json({ success: false, message: "Bank account not found." });
    res.json({ success: true, message: "Bank account removed." });
  } catch (error) {
    next(error);
  }
});

function sendExistingTransfer(res, transaction, payloadHash) {
  if (transaction.idempotencyPayloadHash !== payloadHash) {
    return res.status(409).json({
      success: false,
      message: "This transfer request identifier was already used for a different payment."
    });
  }

  return res.json({
    success: true,
    message: "This transfer was already completed.",
    idempotent: true,
    transaction: {
      id: transaction._id,
      reference: transaction.reference,
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      description: transaction.description,
      createdAt: transaction.createdAt
    },
    recipient: transaction.recipient
      ? {
        name: transaction.recipient.name,
        username: transaction.recipient.username
      }
      : null
  });
}

router.get("/", async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ owner: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({ owner: req.user._id });
    }

    const transactions = await Transaction.find({
      $or: [
        { wallet: wallet._id },
        { sender: req.user._id },
        { recipient: req.user._id }
      ]
    })
      .populate("sender", "name username")
      .populate("recipient", "name username")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      wallet,
      transactions
    });
  } catch (error) {
    next(error);
  }
});

router.get("/recipients/:walletNumber", async (req, res, next) => {
  try {
    const walletNumber = String(req.params.walletNumber || "").trim();

    if (!walletNumber) {
      return res.status(400).json({
        success: false,
        message: "Recipient wallet number is required."
      });
    }

    const wallet = await Wallet.findOne({
      walletNumber,
      status: "active"
    }).populate({
      path: "owner",
      select: "name username role status",
      match: { status: "active" }
    });

    if (!wallet || !wallet.owner) {
      return res.status(404).json({
        success: false,
        message: "Recipient wallet not found."
      });
    }

    if (wallet.owner._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot transfer money to your own wallet."
      });
    }

    res.json({
      success: true,
      recipient: {
        name: wallet.owner.name,
        username: wallet.owner.username,
        role: wallet.owner.role,
        walletNumber: wallet.walletNumber
      }
    });
  } catch (error) {
    next(error);
  }
});

/*
  Transfers use a MongoDB transaction.
  MongoDB Atlas replica sets support transactions.
  Do not use this as a substitute for payment-provider verification.
*/
router.post("/transfer", async (req, res, next) => {
  const amount = Number(req.body.amount);
  const walletNumber = String(req.body.walletNumber || "").trim();
  const idempotencyKey = String(req.get("Idempotency-Key") || "").trim();
  const description = typeof req.body.description === "string"
    ? req.body.description.trim()
    : "";

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid whole-number amount in NGN."
    });
  }

  if (!walletNumber) {
    return res.status(400).json({
      success: false,
      message: "Recipient wallet number is required."
    });
  }

  if (!/^[A-Za-z0-9_-]{16,128}$/.test(idempotencyKey)) {
    return res.status(400).json({
      success: false,
      message: "A valid transfer request identifier is required."
    });
  }

  if (description.length > 300) {
    return res.status(400).json({
      success: false,
      message: "Transfer description cannot exceed 300 characters."
    });
  }

  const idempotencyPayloadHash = crypto.createHash("sha256")
    .update(JSON.stringify({ walletNumber, amount, description }))
    .digest("hex");

  const previousTransaction = await Transaction.findOne({
    sender: req.user._id,
    idempotencyKey
  })
    .select("+idempotencyPayloadHash")
    .populate("recipient", "name username");

  if (previousTransaction) {
    return sendExistingTransfer(res, previousTransaction, idempotencyPayloadHash);
  }

  const session = await mongoose.startSession();

  try {
    let transactionResult;

    await session.withTransaction(async () => {
      const senderWallet = await Wallet.findOne({
        owner: req.user._id,
        status: "active"
      }).session(session);

      const recipientWallet = await Wallet.findOne({
        walletNumber,
        status: "active"
      }).session(session);

      if (!senderWallet) {
        throw Object.assign(new Error("Your wallet is unavailable."), {
          status: 404
        });
      }

      if (!recipientWallet) {
        throw Object.assign(new Error("Recipient wallet not found."), {
          status: 404
        });
      }

      if (senderWallet._id.equals(recipientWallet._id)) {
        throw Object.assign(new Error("You cannot transfer money to your own wallet."), {
          status: 400
        });
      }

      const recipientOwner = await User.findOne({
        _id: recipientWallet.owner,
        status: "active"
      }).session(session);

      if (!recipientOwner) {
        throw Object.assign(new Error("Recipient wallet not found."), {
          status: 404
        });
      }

      if (senderWallet.balance < amount) {
        throw Object.assign(new Error("Insufficient wallet balance."), {
          status: 400
        });
      }

      senderWallet.balance -= amount;
      recipientWallet.balance += amount;

      await senderWallet.save({ session });
      await recipientWallet.save({ session });

      const reference = "KMP-" + crypto.randomUUID();

      const transaction = await Transaction.create([{
        reference,
        type: "transfer",
        sender: req.user._id,
        recipient: recipientWallet.owner,
        wallet: senderWallet._id,
        amount,
        status: "completed",
        description: description || "Wallet transfer",
        idempotencyKey,
        idempotencyPayloadHash
      }], { session });

      transactionResult = transaction[0];
    });

    const recipient = await User.findById(transactionResult.recipient);

    // A notification must not turn a committed money transfer into a failed
    // client response. The transfer itself has already been atomically stored.
    try {
      await Notification.create({
        recipient: transactionResult.recipient,
        actor: req.user._id,
        type: "wallet",
        relatedId: transactionResult._id,
        message: `${req.user.name} sent you ₦${amount.toLocaleString("en-NG")}.`
      });
    } catch (notificationError) {
      console.error("Transfer notification could not be created:", notificationError.message);
    }

    res.status(201).json({
      success: true,
      message: "Transfer completed successfully.",
      transaction: {
        id: transactionResult._id,
        reference: transactionResult.reference,
        type: transactionResult.type,
        amount: transactionResult.amount,
        currency: transactionResult.currency,
        status: transactionResult.status,
        description: transactionResult.description,
        createdAt: transactionResult.createdAt
      },
      recipient: recipient
        ? { name: recipient.name, username: recipient.username }
        : null
    });
  } catch (error) {
    if (error?.code === 11000) {
      const existing = await Transaction.findOne({
        sender: req.user._id,
        idempotencyKey
      })
        .select("+idempotencyPayloadHash")
        .populate("recipient", "name username");

      if (existing) {
        return sendExistingTransfer(res, existing, idempotencyPayloadHash);
      }
    }

    next(error);
  } finally {
    await session.endSession();
  }
});

/*
  This creates a withdrawal request and reserves the amount by
  deducting it from the available balance. If an administrator
  rejects the request, the balance is refunded.
*/
router.post("/withdrawals", async (req, res, next) => {
  const amount = Number(req.body.amount);
  const bankAccountId = String(req.body.bankAccountId || "").trim();
  const description = typeof req.body.description === "string"
    ? req.body.description.trim()
    : "";

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Enter a valid whole-number withdrawal amount."
    });
  }

  if (!mongoose.isValidObjectId(bankAccountId)) {
    return res.status(400).json({
      success: false,
      message: "Select one of your saved bank accounts."
    });
  }

  if (description.length > 300) {
    return res.status(400).json({
      success: false,
      message: "Withdrawal note cannot exceed 300 characters."
    });
  }

  const session = await mongoose.startSession();

  try {
    let created;

    await session.withTransaction(async () => {
      const wallet = await Wallet.findOne({
        owner: req.user._id,
        status: "active"
      }).session(session);

      if (!wallet) {
        throw Object.assign(new Error("Wallet not found."), { status: 404 });
      }

      const bankAccount = await BankAccount.findOne({
        _id: bankAccountId,
        owner: req.user._id
      })
        .select("+accountNameEncrypted +accountNumberLast4")
        .session(session);

      if (!bankAccount) {
        throw Object.assign(new Error("Bank account not found."), { status: 404 });
      }

      if (wallet.balance < amount) {
        throw Object.assign(new Error("Insufficient wallet balance."), { status: 400 });
      }

      wallet.balance -= amount;
      await wallet.save({ session });

      const rows = await Transaction.create([{
        reference: "KMP-" + crypto.randomUUID(),
        type: "withdrawal",
        sender: req.user._id,
        wallet: wallet._id,
        withdrawalBankAccount: bankAccount._id,
        amount,
        status: "pending",
        description: description || "Withdrawal request",
        withdrawalBankName: bankAccount.bankName,
        withdrawalAccountLast4: decryptBankValue(bankAccount.accountNumberLast4)
      }], { session });

      created = rows[0];
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal request submitted for review.",
      transaction: {
        id: created._id,
        reference: created.reference,
        amount: created.amount,
        status: created.status,
        createdAt: created.createdAt
      }
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
});

/*
  Wallet funding is deliberately not simulated.
  A verified payment-provider webhook must credit a wallet.
*/
router.post("/fund", (req, res) => {
  res.status(501).json({
    success: false,
    message: "Wallet funding is not enabled yet. A verified payment gateway must be integrated first."
  });
});

module.exports = router;
