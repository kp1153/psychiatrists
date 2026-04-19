// Psychiatric medicines — salt only, modern generation, class-grouped.
// Brand filled by in-house pharmacy at dispense time.
// Based on Indian psychiatric practice + Telepsychiatry Operational Guidelines 2020.

export const MEDICINES_BY_CONDITION = {
  "Insomnia": [
    { name: "Zolpidem", dose: "5mg, 10mg", class: "Z-drug" },
    { name: "Zopiclone", dose: "3.75mg, 7.5mg", class: "Z-drug" },
    { name: "Eszopiclone", dose: "1mg, 2mg, 3mg", class: "Z-drug" },
    { name: "Ramelteon", dose: "8mg", class: "Melatonin agonist" },
    { name: "Melatonin SR", dose: "3mg, 5mg, 10mg", class: "Melatonin" },
    { name: "Suvorexant", dose: "10mg, 15mg, 20mg", class: "DORA" },
    { name: "Lemborexant", dose: "5mg, 10mg", class: "DORA" },
    { name: "Trazodone", dose: "25mg, 50mg, 100mg", class: "SARI (low-dose sleep)" },
    { name: "Mirtazapine", dose: "7.5mg, 15mg", class: "NaSSA (low-dose sleep)" },
    { name: "Doxepin", dose: "3mg, 6mg", class: "Low-dose TCA (sleep)" },
  ],

  "Migraine": [
    { name: "Sumatriptan", dose: "25mg, 50mg, 100mg", class: "Triptan (abortive)" },
    { name: "Rizatriptan", dose: "5mg, 10mg", class: "Triptan (abortive)" },
    { name: "Zolmitriptan", dose: "2.5mg, 5mg", class: "Triptan (abortive)" },
    { name: "Propranolol", dose: "20mg, 40mg, 80mg", class: "Beta-blocker (prophylaxis)" },
    { name: "Flunarizine", dose: "5mg, 10mg", class: "Ca blocker (prophylaxis)" },
    { name: "Topiramate", dose: "25mg, 50mg, 100mg", class: "Anticonvulsant (prophylaxis)" },
    { name: "Sodium Valproate", dose: "200mg, 300mg, 500mg CR", class: "Anticonvulsant (prophylaxis)" },
    { name: "Amitriptyline", dose: "10mg, 25mg", class: "TCA (prophylaxis)" },
    { name: "Venlafaxine XR", dose: "37.5mg, 75mg", class: "SNRI (prophylaxis)" },
    { name: "Rimegepant", dose: "75mg", class: "Gepant (abortive + preventive)" },
    { name: "Erenumab", dose: "70mg, 140mg inj", class: "CGRP mAb (preventive)" },
  ],

  "Epilepsy": [
    { name: "Sodium Valproate", dose: "200mg, 300mg, 500mg CR", class: "Broad-spectrum AED" },
    { name: "Divalproex Sodium ER", dose: "250mg, 500mg, 750mg", class: "Broad-spectrum AED" },
    { name: "Carbamazepine CR", dose: "100mg, 200mg, 400mg", class: "Na-channel blocker" },
    { name: "Oxcarbazepine", dose: "150mg, 300mg, 600mg", class: "Na-channel blocker" },
    { name: "Lamotrigine", dose: "25mg, 50mg, 100mg, 200mg", class: "Na-channel blocker" },
    { name: "Lacosamide", dose: "50mg, 100mg, 150mg, 200mg", class: "Na-channel (slow)" },
    { name: "Levetiracetam", dose: "250mg, 500mg, 750mg, 1000mg", class: "SV2A modulator" },
    { name: "Brivaracetam", dose: "25mg, 50mg, 100mg", class: "SV2A modulator" },
    { name: "Topiramate", dose: "25mg, 50mg, 100mg", class: "Multi-mechanism AED" },
    { name: "Zonisamide", dose: "25mg, 50mg, 100mg", class: "Multi-mechanism AED" },
    { name: "Gabapentin", dose: "100mg, 300mg, 400mg", class: "Ca ligand" },
    { name: "Pregabalin", dose: "25mg, 50mg, 75mg, 150mg", class: "Ca ligand" },
    { name: "Clobazam", dose: "5mg, 10mg, 20mg", class: "Benzodiazepine (adjunct)" },
    { name: "Perampanel", dose: "2mg, 4mg, 6mg, 8mg", class: "AMPA antagonist" },
  ],

  "Depression": [
    { name: "Escitalopram", dose: "5mg, 10mg, 15mg, 20mg", class: "SSRI" },
    { name: "Sertraline", dose: "25mg, 50mg, 100mg, 150mg, 200mg", class: "SSRI" },
    { name: "Fluoxetine", dose: "20mg, 40mg, 60mg", class: "SSRI" },
    { name: "Paroxetine CR", dose: "12.5mg, 25mg, 37.5mg", class: "SSRI" },
    { name: "Fluvoxamine", dose: "50mg, 100mg, 150mg", class: "SSRI" },
    { name: "Venlafaxine XR", dose: "37.5mg, 75mg, 150mg", class: "SNRI" },
    { name: "Desvenlafaxine", dose: "50mg, 100mg", class: "SNRI" },
    { name: "Duloxetine", dose: "20mg, 30mg, 60mg", class: "SNRI" },
    { name: "Mirtazapine", dose: "7.5mg, 15mg, 30mg, 45mg", class: "NaSSA" },
    { name: "Bupropion SR", dose: "150mg, 300mg", class: "NDRI" },
    { name: "Vortioxetine", dose: "5mg, 10mg, 20mg", class: "Multimodal (serotonin modulator)" },
    { name: "Trazodone", dose: "50mg, 100mg, 150mg", class: "Atypical (SARI)" },
    { name: "Agomelatine", dose: "25mg, 50mg", class: "Atypical (melatonergic)" },
    { name: "Vilazodone", dose: "10mg, 20mg, 40mg", class: "Atypical (SSRI + 5-HT1A PA)" },
    { name: "Tianeptine", dose: "12.5mg, 37.5mg SR", class: "Atypical" },
  ],

  "Anxiety": [
    { name: "Clonazepam", dose: "0.25mg, 0.5mg, 1mg", class: "Benzodiazepine" },
    { name: "Lorazepam", dose: "1mg, 2mg", class: "Benzodiazepine" },
    { name: "Alprazolam", dose: "0.25mg, 0.5mg, 1mg", class: "Benzodiazepine" },
    { name: "Diazepam", dose: "2mg, 5mg, 10mg", class: "Benzodiazepine" },
    { name: "Etizolam", dose: "0.25mg, 0.5mg, 1mg", class: "Benzodiazepine" },
  ],

  "Bipolar": [
    { name: "Divalproex Sodium ER", dose: "250mg, 500mg, 750mg", class: "Mood stabilizer" },
    { name: "Lithium Carbonate", dose: "300mg, 450mg SR", class: "Mood stabilizer" },
    { name: "Oxcarbazepine", dose: "150mg, 300mg, 600mg", class: "Mood stabilizer" },
    { name: "Quetiapine XR", dose: "50mg, 150mg, 300mg", class: "Atypical antipsychotic" },
    { name: "Olanzapine", dose: "2.5mg, 5mg, 10mg, 20mg", class: "Atypical antipsychotic" },
    { name: "Aripiprazole", dose: "5mg, 10mg, 15mg, 30mg", class: "Atypical antipsychotic" },
    { name: "Lurasidone", dose: "20mg, 40mg, 80mg", class: "Atypical antipsychotic" },
    { name: "Cariprazine", dose: "1.5mg, 3mg, 4.5mg", class: "Atypical antipsychotic" },
    { name: "Olanzapine + Fluoxetine", dose: "3mg/25mg, 6mg/25mg, 12mg/25mg", class: "Combo (bipolar depression)" },
  ],

  "Schizophrenia": [
    { name: "Risperidone", dose: "1mg, 2mg, 3mg, 4mg", class: "2nd-gen antipsychotic" },
    { name: "Olanzapine", dose: "2.5mg, 5mg, 10mg, 20mg", class: "2nd-gen antipsychotic" },
    { name: "Quetiapine XR", dose: "50mg, 150mg, 300mg, 400mg", class: "2nd-gen antipsychotic" },
    { name: "Aripiprazole", dose: "5mg, 10mg, 15mg, 30mg", class: "2nd-gen antipsychotic" },
    { name: "Ziprasidone", dose: "20mg, 40mg, 60mg, 80mg", class: "2nd-gen antipsychotic" },
    { name: "Paliperidone ER", dose: "3mg, 6mg, 9mg", class: "2nd-gen antipsychotic" },
    { name: "Amisulpride", dose: "100mg, 200mg, 400mg", class: "2nd-gen antipsychotic" },
    { name: "Lurasidone", dose: "40mg, 80mg, 120mg", class: "2nd-gen antipsychotic" },
    { name: "Asenapine", dose: "5mg, 10mg", class: "2nd-gen antipsychotic" },
    { name: "Clozapine", dose: "25mg, 50mg, 100mg, 200mg", class: "2nd-gen (TRS only)" },
    { name: "Cariprazine", dose: "1.5mg, 3mg, 4.5mg, 6mg", class: "3rd-gen antipsychotic" },
    { name: "Brexpiprazole", dose: "1mg, 2mg, 3mg, 4mg", class: "3rd-gen antipsychotic" },
  ],

  "OCD": [
    { name: "Escitalopram", dose: "10mg, 20mg, 30mg", class: "SSRI" },
    { name: "Sertraline", dose: "50mg, 100mg, 150mg, 200mg", class: "SSRI" },
    { name: "Fluoxetine", dose: "20mg, 40mg, 60mg", class: "SSRI" },
    { name: "Fluvoxamine", dose: "50mg, 100mg, 150mg, 200mg", class: "SSRI" },
    { name: "Paroxetine CR", dose: "12.5mg, 25mg, 37.5mg", class: "SSRI" },
    { name: "Clomipramine", dose: "25mg, 50mg, 75mg", class: "TCA (OCD-specific)" },
    { name: "Aripiprazole", dose: "5mg, 10mg", class: "Augmentation (atypical)" },
    { name: "Risperidone", dose: "1mg, 2mg", class: "Augmentation (atypical)" },
  ],

  "ADHD": [
    { name: "Methylphenidate IR", dose: "5mg, 10mg", class: "Stimulant" },
    { name: "Methylphenidate ER", dose: "10mg, 18mg, 27mg, 36mg", class: "Stimulant" },
    { name: "Lisdexamfetamine", dose: "30mg, 50mg, 70mg", class: "Stimulant (prodrug)" },
    { name: "Atomoxetine", dose: "10mg, 18mg, 25mg, 40mg, 60mg", class: "Non-stimulant (NRI)" },
    { name: "Guanfacine ER", dose: "1mg, 2mg, 3mg, 4mg", class: "Non-stimulant (α2A)" },
    { name: "Clonidine ER", dose: "0.1mg, 0.2mg", class: "Non-stimulant (α2)" },
    { name: "Modafinil", dose: "100mg, 200mg", class: "Wakefulness agent" },
  ],

  "PTSD": [
    { name: "Sertraline", dose: "50mg, 100mg, 150mg, 200mg", class: "SSRI (FDA-approved)" },
    { name: "Paroxetine", dose: "20mg, 40mg", class: "SSRI (FDA-approved)" },
    { name: "Escitalopram", dose: "10mg, 20mg", class: "SSRI" },
    { name: "Venlafaxine XR", dose: "75mg, 150mg", class: "SNRI" },
    { name: "Mirtazapine", dose: "15mg, 30mg", class: "NaSSA (sleep + PTSD)" },
    { name: "Prazosin", dose: "1mg, 2mg, 5mg", class: "α1 blocker (nightmares)" },
    { name: "Topiramate", dose: "25mg, 50mg, 100mg", class: "Anticonvulsant (adjunct)" },
  ],

  "De-addiction": [
    { name: "Naltrexone", dose: "50mg", class: "Opioid antagonist (alcohol/opioid)" },
    { name: "Acamprosate", dose: "333mg", class: "Anti-craving (alcohol)" },
    { name: "Disulfiram", dose: "250mg, 500mg", class: "Aversive (alcohol)" },
    { name: "Baclofen", dose: "10mg, 20mg", class: "GABA-B agonist (alcohol)" },
    { name: "Bupropion SR", dose: "150mg, 300mg", class: "Smoking cessation" },
    { name: "Varenicline", dose: "0.5mg, 1mg", class: "Smoking cessation" },
    { name: "Buprenorphine + Naloxone", dose: "2mg/0.5mg, 8mg/2mg", class: "Opioid substitution" },
    { name: "Methadone", dose: "5mg, 10mg", class: "Opioid substitution" },
  ],

  "Sexual Health": [],
};

export const CONDITIONS = Object.keys(MEDICINES_BY_CONDITION);