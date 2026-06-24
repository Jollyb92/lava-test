import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lava-epd-database-v1';

function expiryStatus(dateStr) {
  if (!dateStr) return 'unknown';
  const diff = (new Date(dateStr) - new Date()) / 86400000;
  if (diff < 0) return 'expired';
  if (diff <= 180) return 'expiring';
  return 'valid';
}

const CATEGORIES = [
  'Concrete & Binders', 'Steel', 'Timber & Engineered Wood',
  'Cladding & Exteriors', 'Insulation', 'Finishes & Coatings', 'Masonry', 'Other',
];

const REUSE_OPTIONS = ['Yes', 'Partial', 'No', 'Unknown'];

const SEED_DATA = [
  { id: 1, productName: 'Concrete of Strength Class C20/25', category: 'Concrete & Binders', subCategory: 'Multi-Use Structural', productDescription: 'Binding, non-structural', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'InformationsZentrum Beton GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'https://www.beton.org/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-IZB-20230420-IBA1-DE', issueDate: '2023-10-20', expiryDate: '2028-10-19', lcaScope: 'A1-B1,C,D', standard: 'EN 15804+A2', gwpA1A3: '157', gwpA4: '3.75', gwpA5: '0.874', gwpB17: '-14', gwpC1C4: '18.67', gwpD: '-12.1', gwpDeltaA1C4: '166.294', recycledContent: '', recyclability: '', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '13.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\d5d98d4b-a9ba-4fb3-b2d2-6766f8ef5a59_00.02.000_EPD.pdf', notes: '' },
  { id: 2, productName: 'Concrete of Strength Class C25/30', category: 'Concrete & Binders', subCategory: 'Multi-Use Structural', productDescription: 'Lighter foundations, slabs', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'InformationsZentrum Beton GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'https://www.beton.org/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-IZB-20230421-IBA1-DE', issueDate: '2023-10-20', expiryDate: '2028-10-19', lcaScope: 'A1-B1,C,D', standard: 'EN 15804+A2', gwpA1A3: '181', gwpA4: '3.95', gwpA5: '0.874', gwpB17: '-14', gwpC1C4: '18.67', gwpD: '-12.1', gwpDeltaA1C4: '190.494', recycledContent: '', recyclability: '', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '13.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\8347f9a7-f4ec-4a36-a266-a0281f5fd16d_00.02.000_EPD.pdf', notes: 'Crushed aggregate reuse possible.' },
  { id: 3, productName: 'Concrete of Strength Class C30/37', category: 'Concrete & Binders', subCategory: 'Multi-Use Structural', productDescription: 'Slabs, walls, low stress columns, staircases', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'InformationsZentrum Beton GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'https://www.beton.org/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-IZB-20230328-IBG1-DE', issueDate: '2023-10-20', expiryDate: '2028-10-19', lcaScope: 'A1-B1,C,D', standard: 'EN 15804+A2', gwpA1A3: '196', gwpA4: '4.35', gwpA5: '0.874', gwpB17: '-14', gwpC1C4: '18.67', gwpD: '-12.1', gwpDeltaA1C4: '205.894', recycledContent: '', recyclability: '', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '12.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\b3fb0ba9-2376-49bf-b21a-7f7a5cd97233_00.02.000_EPD.pdf', notes: 'Crushed aggregate reuse possible.' },
  { id: 4, productName: 'Concrete of Strength Class C35/45', category: 'Concrete & Binders', subCategory: 'Multi-Use Structural', productDescription: 'Heavily loaded columns, transfer slabs, post-tensioned slabs, parking structures', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'InformationsZentrum Beton GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'https://www.beton.org/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPDIZB20230422IBA1DE', issueDate: '2023-10-19', expiryDate: '2028-10-18', lcaScope: 'A1-B1,C,D', standard: 'EN 15804+A2', gwpA1A3: '220', gwpA4: '8.18', gwpA5: '0.874', gwpB17: '-12', gwpC1C4: '18.67', gwpD: '-12.1', gwpDeltaA1C4: '235.724', recycledContent: '', recyclability: '', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '12.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\90999905-ace2-49ee-90f0-f2a649c8989e_00.02.000_EPD.pdf', notes: 'Crushed aggregate reuse possible.' },
  { id: 5, productName: 'Concrete of Strength Class C40/50', category: 'Concrete & Binders', subCategory: 'Multi-Use Structural', productDescription: 'Columns, heavily loaded elements', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'Spenner Herkules', locationOfManufacture: 'Nottuln, Germany', manufacturerWebsite: 'https://spenner-gruppe.de/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-SPE-20230529-IBA2-DE', issueDate: '2023-12-04', expiryDate: '2028-12-03', lcaScope: 'A1-A3,C,D', standard: 'EN 15804+A2', gwpA1A3: '162.5', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '19.92', gwpD: '-12.1', gwpDeltaA1C4: '182.42', recycledContent: '', recyclability: '', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '13.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\97345f6c-b4f4-4761-8863-14fc279ada34_00.02.000_EPD.pdf', notes: '' },
  { id: 6, productName: 'Reinforcement Steel Rebar', category: 'Steel', subCategory: 'Multi-Use Structural', productDescription: 'Reinforcement element', unitOfMeasure: 'kg', declaredUnitQty: '1', manufacturerName: 'solidian GmbH', locationOfManufacture: 'Albstadt, Germany', manufacturerWebsite: 'https://www.solidian.com/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'ift Rosenheim GmbH', epdRegNo: 'EPD-SGR_65.0', issueDate: '2022-12-11', expiryDate: '2027-12-11', lcaScope: 'A1-A3,A5,C,D', standard: 'EN 15804+A2', gwpA1A3: '2.71', gwpA4: '', gwpA5: '0.01140', gwpB17: '', gwpC1C4: '0.018057', gwpD: '-0.00399', gwpDeltaA1C4: '2.739', recycledContent: '0%', recyclability: '62%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '13.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\50cb3dd8-db02-4ba0-a41b-d4d568c13a79_00.00.031_EPD.pdf', notes: '' },
  { id: 7, productName: 'Reinforcement Steel Grid', category: 'Steel', subCategory: 'Multi-Use Structural', productDescription: 'Reinforcement elements for slabs and walls', unitOfMeasure: 'kg', declaredUnitQty: '1', manufacturerName: 'solidian GmbH', locationOfManufacture: 'Albstadt, Germany', manufacturerWebsite: 'https://www.solidian.com/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'ift Rosenheim GmbH', epdRegNo: 'EPD-SGR_65.0', issueDate: '2022-12-11', expiryDate: '2027-12-11', lcaScope: 'A1-A3,A5,C,D', standard: 'EN 15804+A2', gwpA1A3: '23.3', gwpA4: '', gwpA5: '0.0929', gwpB17: '', gwpC1C4: '0.065857', gwpD: '-10.1', gwpDeltaA1C4: '23.459', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '13.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\50cb3dd8-db02-4ba0-a41b-d4d568c13a79_00.00.031_EPD.pdf', notes: '' },
  { id: 8, productName: 'Structural Steel: Sections and Merchant Bars', category: 'Steel', subCategory: 'Structural Frame', productDescription: 'Various structural elements, generalised by production method', unitOfMeasure: 'tonne', declaredUnitQty: '1', manufacturerName: 'bauforumstahl e.V', locationOfManufacture: 'Düsseldorf, Germany', manufacturerWebsite: 'https://bauforumstahl.de/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-BFS-20230271-IBG1-EN', issueDate: '2023-10-06', expiryDate: '2028-10-05', lcaScope: 'A1-A3,C,D', standard: 'EN 15804+A2', gwpA1A3: '560', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '4.845', gwpD: '-62', gwpDeltaA1C4: '564.845', recycledContent: '100%', recyclability: '88%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: 'ND', projectCode: 'LAVA Learning', dateAdded: '13.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\Structural-Steel-Sections-and-merchant-bars-EPD-BFS-20230271-IBG1-EN.pdf', notes: '' },
  { id: 10, productName: 'Balkenschichtholz Duo, Trio and Multi Beams', category: 'Timber & Engineered Wood', subCategory: 'Structural Frame', productDescription: 'Neither glulam nor CLT', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'Studiengemeinschaft Holzleimbau e.V', locationOfManufacture: 'Wuppertal, Germany', manufacturerWebsite: 'https://www.studiengemeinschaft-holzleimbau.de/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-SHL-20240269-IBO1-DE', issueDate: '2025-05-15', expiryDate: '2030-04-14', lcaScope: 'A1-A3,A5,C,D', standard: 'EN 15804+A2', gwpA1A3: '-609.8', gwpA4: '', gwpA5: '6.10', gwpB17: '', gwpC1C4: '744.704', gwpD: '-368', gwpDeltaA1C4: '141.004', recycledContent: '0%', recyclability: '100%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: 'ND', projectCode: 'LAVA Learning', dateAdded: '13.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\e40a3777-8a66-4e0c-bf54-4100ac630cca_EPD.pdf', notes: 'Need to consider fire resistance and bio/moisture protection.' },
  { id: 11, productName: 'Glued Laminated Timber (Glulam)', category: 'Timber & Engineered Wood', subCategory: 'Structural Frame', productDescription: 'Glulam timber', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'Holzwerke Ladenburger', locationOfManufacture: 'Bopfingen, Germany', manufacturerWebsite: 'https://www.ladenburger.de', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-HLG-20220052-IBC1-DE', issueDate: '2022-09-26', expiryDate: '2027-09-25', lcaScope: 'A1-A3,A5,C2-C3,D', standard: 'EN 15804', gwpA1A3: '-636.86', gwpA4: '', gwpA5: '1.29', gwpB17: '', gwpC1C4: '776.558', gwpD: '385', gwpDeltaA1C4: '140.988', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: 'ND', projectCode: 'LAVA Learning', dateAdded: '13.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\73366123-98d1-4fb1-9edc-37ba4ba57331_00.03.000_EPD.pdf', notes: '' },
  { id: 12, productName: 'Glued Laminated Timber (Glulam) from MMHO', category: 'Timber & Engineered Wood', subCategory: 'Structural Frame', productDescription: 'Glulam timber', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'Mayr-Melnhof Holz Holding AG', locationOfManufacture: 'Leoben, Austria', manufacturerWebsite: 'https://www.mm-holz.com/', lavaArchivist: 'F. Chiavegati', programmeOperator: 'EPD International AB', epdRegNo: 'EPD-IES-0004675', issueDate: '2025-07-08', expiryDate: '2030-07-07', lcaScope: 'A1-A3,C,D', standard: 'EN 15804+A2', gwpA1A3: '-620', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '767.857', gwpD: '-356', gwpDeltaA1C4: '147.857', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '100', projectCode: 'LAVA Learning', dateAdded: '13.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\02_EPD_Files\\4b0bcf20-15a5-43f2-1056-08dda827136c_EPD.pdf', notes: '' },
  { id: 13, productName: 'Concrete Roof Tile', category: 'Cladding & Exteriors', subCategory: 'Roof Coverings & Waterproofing', productDescription: 'Various roof tiles made from concrete', unitOfMeasure: 'kg', declaredUnitQty: '1', manufacturerName: 'Leier Hungária Kft', locationOfManufacture: 'Hajdúszoboszló, Hungary', manufacturerWebsite: 'https://www.leier.hu', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-IES-0026689:001', issueDate: '2026-02-05', expiryDate: '2031-02-05', lcaScope: 'A,C,D', standard: 'EN 15804+A2', gwpA1A3: '0.146', gwpA4: '0.0305', gwpA5: '5.77E-4', gwpB17: '', gwpC1C4: '0.022163', gwpD: '-0.00378', gwpDeltaA1C4: '0.168', recycledContent: '0%', recyclability: '90%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Unknown', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\EPD document_EPD-IES-0026689_002_en.pdf', notes: '' },
  { id: 14, productName: 'Portlandcement (CEM I)', category: 'Concrete & Binders', subCategory: 'Multi-Use Structural', productDescription: 'Average Portland cement (CEM I) produced in Germany, 2020 data', unitOfMeasure: 'tonne', declaredUnitQty: '1', manufacturerName: 'Verein Deutscher Zementwerke e.V. (VDZ)', locationOfManufacture: 'Germany', manufacturerWebsite: 'https://www.vdz-online.de', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-VDZ-20220153-IAG1-DE', issueDate: '2022-06-08', expiryDate: '2027-06-07', lcaScope: 'A1-A3', standard: 'EN 15804+A2', gwpA1A3: '665', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '', gwpD: '', gwpDeltaA1C4: '665', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Unknown', assessedLifecycle: 'ND', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\2022-06-08-EPD-CEM_I-D.pdf', notes: 'Raw material ingredient — do not use in geometry calculations.' },
  { id: 15, productName: 'Portlandcement (CEM II)', category: 'Concrete & Binders', subCategory: 'Multi-Use Structural', productDescription: 'Average Portland cement (CEM II) produced in Germany, 2020 data', unitOfMeasure: 'tonne', declaredUnitQty: '1', manufacturerName: 'Verein Deutscher Zementwerke e.V. (VDZ)', locationOfManufacture: 'Germany', manufacturerWebsite: 'https://www.vdz-online.de', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-VDZ-20230234-IAG1-DE', issueDate: '2023-07-11', expiryDate: '2028-07-10', lcaScope: 'A1-A3', standard: 'EN 15804+A2', gwpA1A3: '400', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '', gwpD: '', gwpDeltaA1C4: '400', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Unknown', assessedLifecycle: 'ND', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\EPD_CEM_II_C-M.pdf', notes: 'Raw material ingredient — do not use in geometry calculations.' },
  { id: 16, productName: 'MPC/MPR Sendzimir Galvanized Steel Support Channels', category: 'Steel', subCategory: 'Roof Structure', productDescription: 'Cold-rolled sendzimir galvanized steel support channels (C and toothed profiles)', unitOfMeasure: 'kg', declaredUnitQty: '1', manufacturerName: 'MÜPRO Services GmbH', locationOfManufacture: 'Burgbernheim, Germany', manufacturerWebsite: 'https://www.muepro.de', lavaArchivist: 'F. Chiavegati', programmeOperator: 'EPD International AB', epdRegNo: 'EPD-IES-0018721', issueDate: '2025-05-22', expiryDate: '2030-05-22', lcaScope: 'A1-A3,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '2.73', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '0.033313', gwpD: '-1.19', gwpDeltaA1C4: '2.763', recycledContent: '20.80%', recyclability: '95%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\EPD document EPD-IES-0018721_001 en.pdf', notes: '' },
  { id: 17, productName: 'Aestuver Tx Fire Protection Board', category: 'Cladding & Exteriors', subCategory: 'Facade & Cladding', productDescription: 'Cement-bound, fibreglass-reinforced lightweight concrete fire protection board', unitOfMeasure: 'm2', declaredUnitQty: '1', manufacturerName: 'James Hardie Europe GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.jameshardie.eu', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-JAM-20240184-IBA1-EN', issueDate: '2024-08-15', expiryDate: '2029-08-14', lcaScope: 'A1-A3,A4,A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '34.1', gwpA4: '0.246', gwpA5: '0.892', gwpB17: '', gwpC1C4: '0.648', gwpD: '-0.355', gwpDeltaA1C4: '35.886', recycledContent: '', recyclability: '100%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '25', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\d5e31e8a-c5bc-403f-af41-773c9a439de8_EPD.pdf', notes: '' },
  { id: 18, productName: 'TERRART-light 28', category: 'Cladding & Exteriors', subCategory: 'Facade & Cladding', productDescription: 'Unglazed ceramic terracotta facade panel with hollow-chamber double-shell construction', unitOfMeasure: 'm2', declaredUnitQty: '1', manufacturerName: 'NBK Keramik GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.nbkterracotta.com', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-NBK-20240022-CBA1-EN', issueDate: '2024-06-06', expiryDate: '2029-06-05', lcaScope: 'A1-A3,A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '40.1', gwpA4: '0.455', gwpA5: '0.455', gwpB17: '', gwpC1C4: '0.236', gwpD: '-0.204', gwpDeltaA1C4: '41.246', recycledContent: '', recyclability: '99%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\f3dbf1d2-d817-4b81-8546-4e09a498d942_EPD.pdf', notes: '' },
  { id: 19, productName: 'KeraTwin Ceramic Facade System', category: 'Cladding & Exteriors', subCategory: 'Facade & Cladding', productDescription: 'Glazed ceramic rainscreen facade cladding system including aluminium substructure', unitOfMeasure: 'm2', declaredUnitQty: '1', manufacturerName: 'AGROB Buchtal GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.agrob-buchtal.de', lavaArchivist: 'F. Chiavegati', programmeOperator: 'ift Rosenheim', epdRegNo: 'EPD-KFA-84.0', issueDate: '2024-06-24', expiryDate: '2029-06-24', lcaScope: 'A1-A3,A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '22.68', gwpA4: '0.16', gwpA5: '', gwpB17: '', gwpC1C4: '0.22', gwpD: '-2.7', gwpDeltaA1C4: '23.06', recycledContent: '', recyclability: '96%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\d57300ee-720d-435f-a68f-13e0fc2a5ed4_01.00.002_EPD.pdf', notes: '' },
  { id: 20, productName: 'OSB Board', category: 'Timber & Engineered Wood', subCategory: 'External Walls', productDescription: 'Synthetic resin-bonded, three-layer OSB panels from oriented wood strands', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'Fritz EGGER GmbH & Co. OG', locationOfManufacture: 'Wismar, Germany & Radauti, Romania', manufacturerWebsite: 'www.egger.com', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-EGG-20240403-IBD2-EN', issueDate: '2024-12-19', expiryDate: '2029-12-18', lcaScope: 'A1A3,C1C4,D', standard: 'EN 15804+A2', gwpA1A3: '-805', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '998.4', gwpD: '-475', gwpDeltaA1C4: '193.4', recycledContent: '0%', recyclability: '100%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Yes', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '22.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\EGGER OSB boards.pdf', notes: '' },
  { id: 21, productName: 'ISOCELL Cellulose Blow-in Insulation', category: 'Insulation', subCategory: 'Multi-Use Insulative', productDescription: 'Loose-fill cellulose insulation made from 92% recovered paper with mineral flame retardants', unitOfMeasure: 'kg', declaredUnitQty: '1', manufacturerName: 'ISOCELL GmbH und Co KG', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.isocell.com', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-ISC-20240568-CCA1-EN', issueDate: '2025-05-02', expiryDate: '2030-05-02', lcaScope: 'A1A5,B1B7,C1C4,D', standard: 'EN 15804+A2', gwpA1A3: '-1.423', gwpA4: '0.0514', gwpA5: '0.0757', gwpB17: '', gwpC1C4: '1.550', gwpD: '-0.499', gwpDeltaA1C4: '0.254', recycledContent: '92%', recyclability: '100%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Yes', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '22.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\8173b6c4-48ce-4ada-b92c-d273a2a4acd3_00.02.000_EPD.pdf', notes: '' },
  { id: 22, productName: 'best wood Wood Fibre Insulation Boards', category: 'Insulation', subCategory: 'Multi-Use Insulative', productDescription: 'Dry-process wood fibre insulation boards (MULTITHERM, TOP, ROOM, FLOOR and WALL series)', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'Holzwerk Gebr. Schneider GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.schneider-holz.com', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-HWS-20230344-IBA1-EN', issueDate: '2023-09-20', expiryDate: '2028-09-19', lcaScope: 'A1-A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '-174', gwpA4: '1.6', gwpA5: '2.09', gwpB17: '', gwpC1C4: '263.12', gwpD: '-96.4', gwpDeltaA1C4: '92.81', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '22.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\best_wood_wood_fibre_insulation_boards_eng.pdf', notes: 'GWP A1-A3 is negative due to biogenic carbon storage in wood fibres. Also covers DWD wind protection board applications.' },
  { id: 23, productName: 'Gypsum Plasterboard per DIN EN 520 / DIN 18180', category: 'Finishes & Coatings', subCategory: 'Wall Finishes', productDescription: 'Continuous-process gypsum plasterboard with cardboard liner', unitOfMeasure: 'm2', declaredUnitQty: '1', manufacturerName: 'Bundesverband der Gipsindustrie e.V.', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.gips.de', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-BVG-20210344-IBE1-EN', issueDate: '2022-04-04', expiryDate: '2027-04-03', lcaScope: 'A1-A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '1.01', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '', gwpD: '', gwpDeltaA1C4: '1.01', recycledContent: '3.50%', recyclability: '100%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Yes', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '22.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\GYPSUM_PLASTERBOARD_IN_ACCORDANCE_WITH_DIN_EN_520_AND_DIN_18180__1_.pdf', notes: '' },
  { id: 24, productName: 'Gypsum Fibreboard per DIN EN 15283-2 or ETA', category: 'Finishes & Coatings', subCategory: 'Wall Finishes', productDescription: 'Gypsum + recycled paper fibre board bonded with water only', unitOfMeasure: 'm2', declaredUnitQty: '1', manufacturerName: 'Bundesverband der Gipsindustrie e.V.', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.gips.de', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-BVG-20220090-IAG1-EN', issueDate: '2022-04-04', expiryDate: '2027-04-03', lcaScope: 'A1-A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '4.03', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '', gwpD: '', gwpDeltaA1C4: '4.03', recycledContent: '3.50%', recyclability: '100%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Yes', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '22.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\GYPSUM_FIBREBOARDS_IN_ACCORDANCE_WITH_DIN_EN_15283-2_OR_ETA.pdf', notes: '' },
  { id: 25, productName: 'Dry Screed Plasterboard', category: 'Finishes & Coatings', subCategory: 'Wall Finishes', productDescription: 'Heavy-duty gypsum plasterboard (Type DFH1IR / GKFI) for dry floor construction', unitOfMeasure: 'm2', declaredUnitQty: '1', manufacturerName: 'Bundesverband der Gipsindustrie e.V.', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.gips.de', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-BVG-20210341-IBE1-EN', issueDate: '2022-04-04', expiryDate: '2027-04-03', lcaScope: 'A1-A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '1.81', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '', gwpD: '', gwpDeltaA1C4: '1.81', recycledContent: '3.50%', recyclability: '100%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Yes', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '22.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\DRY_SCREED_PLASTERBOARD.pdf', notes: '' },
  { id: 26, productName: 'Fire-Resistant Plasterboard', category: 'Finishes & Coatings', subCategory: 'Wall Finishes', productDescription: 'Plasterboard with glass fibre reinforced core (Type F per DIN EN 520) for fire protection', unitOfMeasure: 'm2', declaredUnitQty: '1', manufacturerName: 'Bundesverband der Gipsindustrie e.V.', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.gips.de', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-BVG-20210343-IBE1-EN', issueDate: '2022-04-04', expiryDate: '2027-04-03', lcaScope: 'A1-A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '1.17', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '', gwpD: '', gwpDeltaA1C4: '1.17', recycledContent: '3.50%', recyclability: '100%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Yes', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '22.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\FIRE-RESISTANT_PLASTERBOARD.pdf', notes: '' },
  { id: 27, productName: 'Brettsperrholz HASSLACHER Cross Laminated Timber', category: 'Timber & Engineered Wood', subCategory: 'Multi-Use Structural', productDescription: 'Cross laminated timber for multiple structural building properties', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'HASSLACHER Holding GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'https://www.hasslacher.com', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-HAS-20210172-IBD1-DE', issueDate: '2021-08-03', expiryDate: '2026-08-02', lcaScope: 'A1-A3,C,D', standard: 'EN 15804+A2', gwpA1A3: '-660', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '754.42', gwpD: '-410', gwpDeltaA1C4: '94.42', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Partial', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '22.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\EPD_BSP_ISO_14025_und_EN_15804_A2_HASSLACHER_Holding_GmbH_de.pdf', notes: '' },
  { id: 28, productName: 'Mineral Plaster Decorative Finishing Plaster', category: 'Finishes & Coatings', subCategory: 'Wall Finishes', productDescription: 'Mineral factory-made plaster mortar for interior and exterior use', unitOfMeasure: 'kg', declaredUnitQty: '1', manufacturerName: 'Verband für Dämmsysteme, Putz und Mörtel e.V. (VDPM)', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.vdpm.info', lavaArchivist: 'F. Chiavegati', programmeOperator: 'IBU', epdRegNo: 'EPD-VDP-20230399-IBO1-DE', issueDate: '2024-03-12', expiryDate: '2029-03-11', lcaScope: 'A1-A5,B1,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '0.335', gwpA4: '0.0112', gwpA5: '0.0416', gwpB17: '', gwpC1C4: '0.0216', gwpD: '-0.0163', gwpDeltaA1C4: '0.2474', recycledContent: '', recyclability: '78%', eolWasteCategory: 'Non-hazardous', reusePoential: 'No', assessedLifecycle: '40', projectCode: 'LAVA Learning', dateAdded: '22.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\EPD-VDP-20230399-IBO1-DE Putzmortel-Normalputz_Edelputz.pdf', notes: '' },
  { id: 29, productName: 'ROCKWOOL Stone Wool Insulation', category: 'Insulation', subCategory: 'Multi-Use Insulative', productDescription: 'Unfaced or uncoated, resin-bonded stone wool insulation material', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'DEUTSCHE ROCKWOOL GmbH & Co. KG', locationOfManufacture: 'Gladbeck, Germany', manufacturerWebsite: 'https://www.rockwool.com/de/', lavaArchivist: 'I. Krogh', programmeOperator: 'IBU', epdRegNo: 'EPDDRW20240317IBC3EN', issueDate: '2024-08-30', expiryDate: '2029-08-29', lcaScope: 'A,C,D', standard: 'EN 15804+A2', gwpA1A3: '0.189', gwpA4: '0.00252', gwpA5: '0.00387', gwpB17: '', gwpC1C4: '0.00179', gwpD: '0', gwpDeltaA1C4: '0.197', recycledContent: '', recyclability: '0%', eolWasteCategory: 'Non-hazardous', reusePoential: 'No', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\wu-epd-medium-density-rockwool.pdf', notes: '' },
  { id: 30, productName: 'RAVATHERM XPS (X) Extruded Polystyrene Foam Insulation', category: 'Insulation', subCategory: 'Multi-Use Insulative', productDescription: 'Extruded polystyrene foam boards (XPS) with non-halogenated blowing agent', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'RBS Germany GmbH / Ravago Building Solutions', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.ravagobuildingsolutions.com', lavaArchivist: 'I. Krogh', programmeOperator: 'IBU', epdRegNo: 'EPD-RAV-20230375-CBD1-EN', issueDate: '2023-10-31', expiryDate: '2028-10-30', lcaScope: 'A1A3,A4+A5,C,D', standard: 'EN 15804+A2', gwpA1A3: '93.8', gwpA4: '3.01', gwpA5: '3.11', gwpB17: '', gwpC1C4: '117.719', gwpD: '-38.36', gwpDeltaA1C4: '217.639', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Unknown', reusePoential: 'No', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\RAVATHERM-XPS-(X)', notes: '' },
  { id: 31, productName: 'Alsitherm EPS 032 Carbon Insulation', category: 'Insulation', subCategory: 'Multi-Use Insulative', productDescription: 'EPS facade insulation board made of grey and white expanded polystyrene with graphite (infrared absorber)', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'Alsecco GmbH', locationOfManufacture: 'Wildeck, Germany', manufacturerWebsite: 'www.alsecco.de', lavaArchivist: 'I. Krogh', programmeOperator: 'IBU', epdRegNo: 'EPD-ALS-20240415-CBC1-DE', issueDate: '2023-12-07', expiryDate: '2028-12-06', lcaScope: 'A1-A3,A4,A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '54.5', gwpA4: '0.231', gwpA5: '0.425', gwpB17: '', gwpC1C4: '52.115', gwpD: '-23.6', gwpDeltaA1C4: '', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Unknown', reusePoential: 'Unknown', assessedLifecycle: '60', projectCode: 'LAVA Learning', dateAdded: '19.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\Alsitherm-EPS-032-Carbon-(2)', notes: '' },
  { id: 32, productName: 'BauderPIR SDS / M / MF Insulation Board', category: 'Insulation', subCategory: 'Multi-Use Insulative', productDescription: 'Closed-cell polyurethane (PU) rigid foam thermal insulation board with mineral fleece facings', unitOfMeasure: 'm2', declaredUnitQty: '1', manufacturerName: 'Paul Bauder GmbH & Co. KG', locationOfManufacture: 'Halle, Germany', manufacturerWebsite: 'www.bauder.de', lavaArchivist: 'I. Krogh', programmeOperator: 'IBU', epdRegNo: 'EPD-BAU-20220210-CBC1-EN', issueDate: '2022-10-11', expiryDate: '2027-09-11', lcaScope: 'A1A3,A4,A5+C+D', standard: 'EN 15804+A2', gwpA1A3: '9.56', gwpA4: '0.0268', gwpA5: '0.377', gwpB17: '', gwpC1C4: '7.7439', gwpD: '-3.15', gwpDeltaA1C4: '17.708', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Unknown', reusePoential: 'No', assessedLifecycle: '', projectCode: 'LAVA Learning', dateAdded: '20.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\bauderpir-sds-m-mf-ohne-bmb', notes: '' },
  { id: 33, productName: 'Fixit 222 Aerogel High Performance Insulating Plaster', category: 'Insulation', subCategory: 'Multi-Use Insulative', productDescription: 'Mineral-based aerogel high performance insulating plaster/render dry mix for thermal renovation', unitOfMeasure: 'kg', declaredUnitQty: '1', manufacturerName: 'Fixit AG', locationOfManufacture: 'Switzerland', manufacturerWebsite: 'https://www.fixit.ch/', lavaArchivist: 'I. Krogh', programmeOperator: 'IBU', epdRegNo: 'EPD-FIX-20210051-ICD1-EN', issueDate: '2022-06-20', expiryDate: '2027-06-19', lcaScope: 'A1A3,A4,A5,C2,C4', standard: 'EN 15804+A2', gwpA1A3: '4.39', gwpA4: '0.0038', gwpA5: '0.0042', gwpB17: '', gwpC1C4: '6150', gwpD: '0', gwpDeltaA1C4: '', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Unknown', reusePoential: 'No', assessedLifecycle: '40', projectCode: 'LAVA Learning', dateAdded: '20.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\EPD-Fixit-222-Aerogel-High-Performance-Insulating-Plaster-en', notes: '' },
  { id: 34, productName: 'Facing Bricks, Pavers and Brick Slips', category: 'Masonry', subCategory: 'Multi-Use Structural', productDescription: 'Coarse ceramic fired clay building materials: facing bricks, paving bricks and brick slips', unitOfMeasure: 'tonne', declaredUnitQty: '1', manufacturerName: 'Federal Association of the German Brick and Tile Industry e.V.', locationOfManufacture: 'Germany', manufacturerWebsite: 'www.ziegel.de', lavaArchivist: 'I. Krogh', programmeOperator: 'IBU', epdRegNo: 'EPD-ZWM-20210148-ICG1-DE', issueDate: '2021-09-16', expiryDate: '2026-09-15', lcaScope: 'A1-A3,A4,A5,C1-C4,D', standard: 'EN15804+A1', gwpA1A3: '255.55', gwpA4: '12.5', gwpA5: '9.28', gwpB17: '', gwpC1C4: '5.93', gwpD: '2.44', gwpDeltaA1C4: '283.26', recycledContent: '3%', recyclability: '0%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Yes', assessedLifecycle: '150', projectCode: 'LAVA Learning', dateAdded: '20.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\Facing bricks-Environmental Product Declaration', notes: '' },
  { id: 35, productName: 'GIMA Lehmziegel (Unfired Clay Brick)', category: 'Masonry', subCategory: 'Multi-Use Structural', productDescription: 'Unfired clay bricks made from 70% clay mixture and 30% natural mineral additives', unitOfMeasure: 'tonne', declaredUnitQty: '1', manufacturerName: 'Girnghuber GmbH', locationOfManufacture: 'Germany', manufacturerWebsite: 'https://www.gima-ziegel.de/de/', lavaArchivist: 'I. Krogh', programmeOperator: 'Kiwa-Ecobility Experts', epdRegNo: 'EPD-Kiwa-EE-188760-EN', issueDate: '2025-02-04', expiryDate: '2030-02-04', lcaScope: 'A1-A3,A4,A5,C1-C4,D', standard: 'EN 15804+A2', gwpA1A3: '45.2', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '8.48', gwpD: '-4.17', gwpDeltaA1C4: '', recycledContent: '0%', recyclability: '99%', eolWasteCategory: 'Non-hazardous', reusePoential: 'Yes', assessedLifecycle: '50', projectCode: 'LAVA Learning', dateAdded: '20.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\GIMA Lehmziegel_Unfired clay brick', notes: '' },
  { id: 36, productName: 'Ytong AAC Energo Ultra+ PP2.2/0.3 PL', category: 'Masonry', subCategory: 'Multi-Use Structural', productDescription: 'Unreinforced blocks made of autoclaved aerated concrete (AAC) for monolithic masonry walls', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'Xella Baustoffe GmbH', locationOfManufacture: 'Germany/Poland', manufacturerWebsite: 'https://www.xella.pl/', lavaArchivist: 'I. Krogh', programmeOperator: 'IBU', epdRegNo: 'EPD-XEL-20250025-IBA1-EN', issueDate: '2025-11-03', expiryDate: '2030-10-03', lcaScope: 'A1A3,A4,A5,B1,C1C4,D', standard: 'EN 15804+A2', gwpA1A3: '147', gwpA4: '1.84', gwpA5: '6.91', gwpB17: '-60.3', gwpC1C4: '7.717', gwpD: '-3.48', gwpDeltaA1C4: '103.167', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Unknown', reusePoential: 'Yes', assessedLifecycle: '80', projectCode: 'LAVA Learning', dateAdded: '20.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\Ytong AAC Energo Ultra+ PP2.20.3 PL', notes: '' },
  { id: 37, productName: 'Autoclaved Aerated Concrete (AAC)', category: 'Masonry', subCategory: 'Multi-Use Structural', productDescription: 'Non-reinforced autoclaved aerated concrete', unitOfMeasure: 'm3', declaredUnitQty: '1', manufacturerName: 'Bundesverband Porenbetonindustrie e.V.', locationOfManufacture: 'Germany', manufacturerWebsite: 'https://www.bv-porenbeton.de/', lavaArchivist: 'I. Krogh', programmeOperator: 'IBU', epdRegNo: 'EPD-BPV-20230453-IBG3-EN', issueDate: '2023-12-12', expiryDate: '2028-10-24', lcaScope: 'A1A3,A4,A5,B1,C1C4,D', standard: 'EN 15804+A2', gwpA1A3: '207', gwpA4: '2.63', gwpA5: '5.75', gwpB17: '-80.1', gwpC1C4: '9.24', gwpD: '-3.21', gwpDeltaA1C4: '144.52', recycledContent: '0%', recyclability: '0%', eolWasteCategory: 'Unknown', reusePoential: 'Yes', assessedLifecycle: '80', projectCode: 'LAVA Learning', dateAdded: '20.05.2026', epdDocumentLink: '\\LAVAzero - Documents\\04_EPD_Database\\11.2.5_Porenbeton_EPD-20230453-EN_Autoclaved_aerated_concrete', notes: '' },
];

const EMPTY_ENTRY = {
  productName: '', category: '', subCategory: '', productDescription: '',
  unitOfMeasure: '', declaredUnitQty: '1',
  manufacturerName: '', locationOfManufacture: '', manufacturerWebsite: '',
  lavaArchivist: '', programmeOperator: '',
  epdRegNo: '', issueDate: '', expiryDate: '', lcaScope: '', standard: '',
  gwpA1A3: '', gwpA4: '', gwpA5: '', gwpB17: '', gwpC1C4: '', gwpD: '', gwpDeltaA1C4: '',
  recycledContent: '', recyclability: '', eolWasteCategory: '', reusePoential: 'Unknown',
  assessedLifecycle: '', projectCode: 'LAVA Learning',
  dateAdded: new Date().toLocaleDateString('de-DE').replace(/\//g, '.'),
  epdDocumentLink: '', notes: '',
};

function Section({ label, accent, children }) {
  return (
    <div className="epd-section">
      <div className="epd-section-label" style={{ color: accent }}>{label}</div>
      <div className="epd-section-grid">{children}</div>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <div className={`epd-field${full ? ' epd-field--full' : ''}`}>
      <label className="epd-field-label">{label}</label>
      {children}
    </div>
  );
}

export default function EPDDatabase({ accentColor }) {
  const [entries, setEntries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : SEED_DATA;
    } catch { return SEED_DATA; }
  });

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [view, setView] = useState('list');
  const [formData, setFormData] = useState(null);
  const [editId, setEditId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const isLight = accentColor === '#B3F400';
  const btnStyle = { background: accentColor, color: isLight ? '#1a1a1a' : '#fff' };
  const allCats = [...new Set(entries.map(e => e.category).filter(Boolean))].sort();

  const filtered = entries.filter(e => {
    const q = search.toLowerCase().trim();
    if (q && ![e.productName, e.category, e.epdRegNo, e.manufacturerName]
      .some(v => v?.toLowerCase().includes(q))) return false;
    if (filterCat && e.category !== filterCat) return false;
    return true;
  });

  function openAdd() {
    setFormData({ ...EMPTY_ENTRY });
    setEditId(null);
    setView('form');
  }

  function openEdit(entry) {
    setFormData({ ...entry });
    setEditId(entry.id);
    setView('form');
  }

  function f(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }));
  }

  function save() {
    if (!formData.productName?.trim()) return;
    if (editId === null) {
      setEntries(prev => [...prev, { ...formData, id: Date.now() }]);
    } else {
      setEntries(prev => prev.map(e => e.id === editId ? { ...formData } : e));
    }
    setView('list');
  }

  function doDelete() {
    setEntries(prev => prev.filter(e => e.id !== editId));
    setDeleteConfirm(false);
    setView('list');
  }

  function backToList() {
    setView('list');
    setFormData(null);
    setDeleteConfirm(false);
  }

  // ── FORM VIEW ──────────────────────────────────────────────────────────────
  if (view === 'form' && formData) {
    return (
      <div className="epd-form-wrap">
        <div className="epd-form-topbar">
          <button className="epd-back-btn" onClick={backToList}>← Back</button>
          <span className="epd-form-heading">{editId === null ? 'Add New Entry' : 'Edit Entry'}</span>
          {editId !== null && (
            <button className="epd-form-del-btn" onClick={() => setDeleteConfirm(true)}>Delete</button>
          )}
        </div>

        <div className="epd-form-body">
          <Section label="Product Identity" accent={accentColor}>
            <Field label="Product Name *" full>
              <input className="epd-input" value={formData.productName} onChange={e => f('productName', e.target.value)} placeholder="Required" />
            </Field>
            <Field label="Category">
              <select className="epd-input" value={formData.category} onChange={e => f('category', e.target.value)}>
                <option value="">Select…</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Sub-Category">
              <input className="epd-input" value={formData.subCategory} onChange={e => f('subCategory', e.target.value)} />
            </Field>
            <Field label="Unit of Measure">
              <input className="epd-input" value={formData.unitOfMeasure} onChange={e => f('unitOfMeasure', e.target.value)} placeholder="m3, m2, kg, tonne…" />
            </Field>
            <Field label="Declared Unit Qty">
              <input className="epd-input" value={formData.declaredUnitQty} onChange={e => f('declaredUnitQty', e.target.value)} />
            </Field>
            <Field label="Description" full>
              <textarea className="epd-input epd-textarea" rows={2} value={formData.productDescription} onChange={e => f('productDescription', e.target.value)} />
            </Field>
          </Section>

          <Section label="Manufacturer" accent={accentColor}>
            <Field label="Manufacturer Name" full>
              <input className="epd-input" value={formData.manufacturerName} onChange={e => f('manufacturerName', e.target.value)} />
            </Field>
            <Field label="Location">
              <input className="epd-input" value={formData.locationOfManufacture} onChange={e => f('locationOfManufacture', e.target.value)} />
            </Field>
            <Field label="Website">
              <input className="epd-input" value={formData.manufacturerWebsite} onChange={e => f('manufacturerWebsite', e.target.value)} />
            </Field>
            <Field label="LAVA Archivist">
              <input className="epd-input" value={formData.lavaArchivist} onChange={e => f('lavaArchivist', e.target.value)} />
            </Field>
            <Field label="Programme Operator">
              <input className="epd-input" value={formData.programmeOperator} onChange={e => f('programmeOperator', e.target.value)} />
            </Field>
          </Section>

          <Section label="EPD Registration" accent={accentColor}>
            <Field label="EPD Reg. No." full>
              <input className="epd-input" value={formData.epdRegNo} onChange={e => f('epdRegNo', e.target.value)} />
            </Field>
            <Field label="Issue Date">
              <input className="epd-input" type="date" value={formData.issueDate} onChange={e => f('issueDate', e.target.value)} />
            </Field>
            <Field label="Expiry Date">
              <input className="epd-input" type="date" value={formData.expiryDate} onChange={e => f('expiryDate', e.target.value)} />
            </Field>
            <Field label="LCA Scope">
              <input className="epd-input" value={formData.lcaScope} onChange={e => f('lcaScope', e.target.value)} placeholder="A1-A3,C,D" />
            </Field>
            <Field label="Standard">
              <input className="epd-input" value={formData.standard} onChange={e => f('standard', e.target.value)} placeholder="EN 15804+A2" />
            </Field>
          </Section>

          <Section label="GWP Values (kg CO₂e / declared unit)" accent={accentColor}>
            <Field label="A1–A3"><input className="epd-input" value={formData.gwpA1A3} onChange={e => f('gwpA1A3', e.target.value)} /></Field>
            <Field label="A4 Transport"><input className="epd-input" value={formData.gwpA4} onChange={e => f('gwpA4', e.target.value)} /></Field>
            <Field label="A5 Installation"><input className="epd-input" value={formData.gwpA5} onChange={e => f('gwpA5', e.target.value)} /></Field>
            <Field label="B1–B7 Use Stage"><input className="epd-input" value={formData.gwpB17} onChange={e => f('gwpB17', e.target.value)} /></Field>
            <Field label="C1–C4 End of Life"><input className="epd-input" value={formData.gwpC1C4} onChange={e => f('gwpC1C4', e.target.value)} /></Field>
            <Field label="D Beyond Boundary"><input className="epd-input" value={formData.gwpD} onChange={e => f('gwpD', e.target.value)} /></Field>
            <Field label="Δ A1–C4 Total"><input className="epd-input" value={formData.gwpDeltaA1C4} onChange={e => f('gwpDeltaA1C4', e.target.value)} /></Field>
          </Section>

          <Section label="Resource &amp; End of Life" accent={accentColor}>
            <Field label="Recycled Content (%)"><input className="epd-input" value={formData.recycledContent} onChange={e => f('recycledContent', e.target.value)} /></Field>
            <Field label="Recyclability (%)"><input className="epd-input" value={formData.recyclability} onChange={e => f('recyclability', e.target.value)} /></Field>
            <Field label="EoL Waste Category"><input className="epd-input" value={formData.eolWasteCategory} onChange={e => f('eolWasteCategory', e.target.value)} /></Field>
            <Field label="Reuse Potential">
              <select className="epd-input" value={formData.reusePoential} onChange={e => f('reusePoential', e.target.value)}>
                {REUSE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Assessed Lifecycle (Yrs)"><input className="epd-input" value={formData.assessedLifecycle} onChange={e => f('assessedLifecycle', e.target.value)} /></Field>
          </Section>

          <Section label="Project &amp; Admin" accent={accentColor}>
            <Field label="Project Code"><input className="epd-input" value={formData.projectCode} onChange={e => f('projectCode', e.target.value)} /></Field>
            <Field label="Date Added"><input className="epd-input" value={formData.dateAdded} onChange={e => f('dateAdded', e.target.value)} placeholder="DD.MM.YYYY" /></Field>
            <Field label="EPD Document Link / Path" full>
              <textarea className="epd-input epd-textarea" rows={2} value={formData.epdDocumentLink} onChange={e => f('epdDocumentLink', e.target.value)} />
            </Field>
            <Field label="Notes" full>
              <textarea className="epd-input epd-textarea" rows={2} value={formData.notes} onChange={e => f('notes', e.target.value)} />
            </Field>
          </Section>
        </div>

        <div className="epd-form-footer">
          <button className="epd-cancel-btn" onClick={backToList}>Cancel</button>
          <button className="epd-save-btn" style={btnStyle}
            disabled={!formData.productName?.trim()} onClick={save}>
            Save Entry
          </button>
        </div>

        {deleteConfirm && (
          <div className="epd-overlay">
            <div className="epd-confirm-box">
              <div className="epd-confirm-title">Delete this entry?</div>
              <div className="epd-confirm-name">{formData.productName}</div>
              <p className="epd-confirm-note">This action cannot be undone.</p>
              <div className="epd-confirm-actions">
                <button className="epd-cancel-btn" onClick={() => setDeleteConfirm(false)}>Cancel</button>
                <button className="epd-del-btn" onClick={doDelete}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="epd-list-wrap">
      <div className="epd-toolbar">
        <div className="epd-search">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <circle cx="4.5" cy="4.5" r="3" stroke="#9CA3AF" strokeWidth="1.3" />
            <path d="M7 7L9.5 9.5" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input className="epd-search-input" placeholder="Search product, EPD no, manufacturer…"
            value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button className="epd-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <select className="epd-cat-filter" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All categories</option>
          {allCats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button className="epd-add-btn" style={btnStyle} onClick={openAdd}>+ Add</button>
      </div>

      <div className="epd-table-scroll">
        <table className="epd-table">
          <thead>
            <tr>
              {['#', 'Product', 'Category', 'GWP A1–A3', 'Unit', 'Expiry', ''].map(h => (
                <th key={h} style={{ background: accentColor, color: isLight ? '#1a1a1a' : '#fff' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="epd-empty">No entries found.</td></tr>
            )}
            {filtered.map((e, i) => {
              const st = expiryStatus(e.expiryDate);
              const expLabel = e.expiryDate ? e.expiryDate.split('-').reverse().join('.') : '—';
              return (
                <tr key={e.id} className={`epd-row${i % 2 ? '' : ' epd-row-alt'}`}>
                  <td className="epd-td epd-td-id">{i + 1}</td>
                  <td className="epd-td epd-td-name">{e.productName}</td>
                  <td className="epd-td epd-td-cat">
                    <span className="epd-cat-chip">{e.category}</span>
                  </td>
                  <td className="epd-td epd-td-gwp">
                    {e.gwpA1A3 !== '' && e.gwpA1A3 != null ? e.gwpA1A3 : '—'}
                  </td>
                  <td className="epd-td epd-td-unit">{e.unitOfMeasure || '—'}</td>
                  <td className="epd-td epd-td-expiry">
                    <span className={`epd-status epd-status--${st}`}>{expLabel}</span>
                  </td>
                  <td className="epd-td epd-td-action">
                    <button className="epd-edit-row-btn" onClick={() => openEdit(e)}>Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="epd-list-footer">
        <span>{filtered.length} of {entries.length} entries</span>
        <span className="epd-legend">
          <span className="epd-dot epd-dot--valid" /> Valid
          <span className="epd-dot epd-dot--expiring" /> Expiring &lt;6 mo
          <span className="epd-dot epd-dot--expired" /> Expired
          · Saved locally
        </span>
      </div>
    </div>
  );
}
