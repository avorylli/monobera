"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@bera/ui/alert";
import { Button } from "@bera/ui/button";
import { Checkbox } from "@bera/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@bera/ui/dialog";
import { Icons } from "@bera/ui/icons";

import Terms from "./utils/terms-of-use.json";

export const TermsOfUse = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="leading-12 text-center text-5xl font-bold">
        Public Testnet Terms of Use
      </div>
      <div className="text-center text-lg font-semibold leading-7">
        Last updated: January 1, 2024
      </div>
      <div className="leading-6">
        These Public Testnet Terms of Use (these “<b>Terms</b>”) apply to your
        access to and use of the websites, platform, software, technologies,
        features, and other online products and services (collectively, the “
        <b>Services</b>
        ”) provided or made available by Berachain Corporation (the “
        <b>Company</b>
        ”, “<b>we</b>
        ”, “<b>our</b>” or “<b>us</b>
        ”) in connection with the Berachain protocol (the “<b>Protocol</b>
        ”) incentivized public testnet (the “<b>Testnet</b>
        ”).
      </div>
      <div className="text-center text-lg font-semibold leading-7">
        YOUR PARTICIPATION IN THE TESTNET IS ENTIRELY VOLUNTARY. IF YOU ARE
        PARTICIPATING IN THE TESTNET, YOU MUST STRICTLY ADHERE TO THESE TERMS.
      </div>
      <div className="text-sm leading-6">
        Please read these Terms carefully as it governs your use of the Testnet
        and the Services. These Terms contain important information, including a
        binding arbitration provision and a class action waiver, both of which
        impact your rights as to how disputes are resolved.
      </div>
      {Terms.content.map((term, index) => (
        <div key={index} className="flex flex-col gap-8">
          <div className="text-center text-2xl font-semibold leading-8">
            {index + 1}. {term.title}
          </div>
          <>
            {term.content.map((text, index) => (
              <div key={index} className="text-sm leading-6">
                {text}
              </div>
            ))}
          </>
        </div>
      ))}
    </div>
  );
};

export const TermOfUseModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const [checked, setChecked] = useState(false);
  const [alert, setAlert] = useState(false);
  return (
    <Dialog open={open}>
      <DialogContent
        hideClose
        className="focus:outline-none md:w-[calc(100vw-32px)] lg:w-[800px] lg:min-w-[800px]"
      >
        <DialogHeader>
          <DialogTitle className="mb-3">Terms of Service</DialogTitle>
        </DialogHeader>
        <div className="flex h-[calc(100vh-200px)] flex-col gap-4 lg:h-[600px]">
          <div className="h-full flex-grow-0 overflow-y-scroll rounded-xl border border-border bg-muted p-4 pr-8">
            <TermsOfUse />
          </div>
          <div className="text-sm leading-6">
            By checking the box below and using our services, you acknowledge
            that you have read, understood, and agree to be bound by the{" "}
            <a className="font-bold underline" href="terms-of-use">
              terms and conditions
            </a>
            , including any additional guidelines and future modifications (the
            &quot;Terms of Service&quot;). If you do not agree to these terms,
            please do not use our services.
          </div>
          <div className="flex space-x-2">
            <Checkbox
              id="terms"
              className="mt-1.5"
              checked={checked}
              onCheckedChange={(checked: boolean) => {
                setChecked(checked);
                if (checked) setAlert(false);
              }}
            />
            <label
              htmlFor="terms"
              className="text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I have read, understood, and agree to be bound by the terms and
              conditions, including any additional guidelines and future
              modifications outlined in the Public Testnet Terms of Use.
            </label>
          </div>
          {alert && (
            <Alert variant="warning">
              <AlertTitle>
                {" "}
                <Icons.info className="inline-block h-4 w-4" /> You Must Agree
                to User Our Services
              </AlertTitle>
              <AlertDescription className="text-xs">
                Looks like you selected “I Disagree”, unfortunately you
                won&apos;t be able to use our services unless you agree to our
                terms of use agreement.
              </AlertDescription>
            </Alert>
          )}
          <div className="flex gap-4">
            <Button
              disabled={!checked}
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              I AGREE
            </Button>
            <Button
              onClick={() => setAlert(true)}
              variant={"outline"}
              className="flex-1"
            >
              I DISAGREE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
