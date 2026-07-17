import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { MessageService } from 'primeng/api';
import { Intimation as IntimationService } from '../../core/services/intimation';
import { IntimationSlip } from '../../components/intimation-slip/intimation-slip';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    RadioButtonModule,
    TextareaModule,
    SelectModule,
    TabsModule,
    IntimationSlip,
  ],
  providers: [DatePipe],
  templateUrl: './scanner.html',
  styleUrl: './scanner.scss',
})
export class Scanner implements AfterViewInit, OnInit {
  @ViewChild('scannerInputField') scannerInputField!: ElementRef;
  @ViewChild('markingSheetInput') markingSheetInput!: ElementRef;

  scannerInput: string = '';
  showDetails: boolean = false;
  toolInfo: any = null;
  loading: boolean = false;

  // Checklist Modal
  showChecklistModal: boolean = false;
  checklistData: any = null;
  checklistSource: string = '';

  visibleSlip: boolean = false;

  // PM Plan Modal
  showAddPMPlanModal: boolean = false;
  newPMPlan: any = {
    tool_code: '',
    planned_date: '',
    customer: 'MATE',
    machine_tonnage: '',
    req_hours: null as number | null,
    remark: ''
  };

  // Remarks Popup (triggered when NOT_OK is selected in check-out checklist)
  showRemarksPopup: boolean = false;
  activeRemarkItem: any = null;
  tempRemark: string = '';

  // Breakdown Workflow Variables
  showBDInspectionModal: boolean = false;
  bdInspectionData = { breakdown_type: 'MAJOR', remarks: '' };
  showMinorCloseModal: boolean = false;
  minorCloseData = { 
    inspection_remarks: '', 
    corrective_action: '', 
    repaired_by: '',
    spares_consumed: [] as any[]
  };

  // Action Update Modal
  showActionModal: boolean = false;
  submittingCheckOut: boolean = false;
  markingSheetFile: File | null = null;
  activeActionTabIndex: string = '0';
  sparesList: any[] = [];
  sparesLoaded: boolean = false;

  actionData: any = {
    inspection_remarks: '',
    repaired_by: '',
    problem_cause: '',
    corrective_action: '',
    broken_parts: [],
    spares_consumed: [],
    why1: '',
    why2: '',
    why3: '',
    why4: '',
    why5: '',
  };

  // PM Checksheet Modal
  showPMChecksheetModal: boolean = false;

  @ViewChild('beforeImageInput') beforeImageInput!: ElementRef;
  @ViewChild('afterImageInput') afterImageInput!: ElementRef;

  // PM Action Modal
  showPMActionModal: boolean = false;
  pmActionData: any = {
    corrective_actions: [],
    spares_consumed: [],
    kaizen_problem_status: '',
    kaizen_countermeasure: ''
  };
  kaizenBeforeFile: File | null = null;
  kaizenAfterFile: File | null = null;
  kaizenBeforePreview: string | null = null;
  kaizenAfterPreview: string | null = null;
  activePMTab: string = '0';
  showPMChecksheetRemarksPopup: boolean = false;
  activePMChecksheetRemarkItem: any = null;
  tempPMChecksheetRemark: string = '';

  pmChecksheetCategories = [
    {
      name: 'Common Items',
      items: [
        { area: 'LIFTING HOLES', parameter: 'LIFTING HOLES', standard: 'Free from damages in thread, Rust, chamferless', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'LIFTING HOLES', parameter: 'EYE BOLTS', standard: 'Eye bolts fully & securely tightened into lifting holes ( neck must seat fully ). Not bend', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'OUTER SURFACE', parameter: 'OUTER SURFACE', standard: 'Free from rust, damage, bulging, resin sticky', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'OUTER SURFACE', parameter: 'EJ PLATE COVER', standard: 'Check for cover with good condition', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'LOCATING RING', parameter: 'LOCATING RING', standard: 'Free from damage, bolt looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'LOCATING RING', parameter: 'LOCATING RING ID & SPRUE BUSH', standard: 'No GAP between Locating Ring ID & Sprue bush OD', method: 'Feeler Gauge', status: 'NOT_OK', remark: '' },
        { area: 'PAINTING', parameter: 'PAINTING', standard: 'Check for Painting peel-off on Outer surface. Painting to be as per colour coding decided', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'MOLD LEGS / PROTECTION BLOCKS', parameter: 'MOLD LEGS / PROTECTION BLOCKS', standard: 'Free from bolt looseness, bolt missing', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'MOLD LOCK PLATE', parameter: 'LOCK PLATE', standard: 'Free from damages, bolt missing', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'CAM/LINK / ROD / LATCHES / LIMIT BOLTS', parameter: 'CAM / LINK / ROD / LATCHES', standard: 'Should be in working condition, Free from bolt looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'CALENDER', parameter: 'CALENDER', standard: 'Free from movement jam & update', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'COOLING COUPLERS', standard: 'Free from damages, Looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'PU PIPE FITTINGS / VALVES', standard: 'Free from damages, Looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'MANIFOLD BLOCKS - DAMAGE & RUST', standard: 'Free from damages, Looseness, blockages & rust, etc', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'MANIFOLD BLOCKS - POSITION', standard: 'Should not be near to H/Runner Connector Boxes / wire', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'COOLING LINES', standard: 'Free from blockage, rust etc. No IN-OUT connection at Mould top side with straight nipples ( in cases where H/R connection is near ). If required, use elbow fitting with extended length at Non-Operator side.', method: 'Descaling system & Air Pressure / LEAKAGE TESTER', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'COOLING PLUGS', standard: 'Free from leakage', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'General Check Point - Interface', standard: 'All Standard interfaces to be used, Not to extend beyond mould base', method: 'Standard Parts', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'General Check Point - O-Rings', standard: 'O-Rings to be replaced', method: 'PARKER / Equivalent', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'General Check Point - Looping', standard: 'Cooling connection proper on mould. ( No looping & long pipes. Wherever looping necessary, use elbow nipples )', method: 'Cooling Circuit plate', status: 'NOT_OK', remark: '' },
        { area: 'COOLING SYSTEM', parameter: 'General Check Point - Flow Rate', standard: 'Flow Rate after De-scaling as per standard ( Actuals to be mentioned in sheet )', method: 'Digital Flow Meter', status: 'NOT_OK', remark: '' },
        { area: 'GUIDE PILLAR/BUSH', parameter: 'GUIDE PILLAR/BUSH', standard: 'Free from scoring, bend, damages, looseness/play, tight alignment, lack of grease etc', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'GUIDE PILLAR/BUSH', parameter: 'Stopper for GP/GB', standard: 'Check for stopper missing / loose', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'POSITIONING PARTS', parameter: 'MOLD POSITIONING PARTS', standard: 'Free from damages, Looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' }
      ]
    },
    {
      name: 'Hydraulic System',
      items: [
        { area: 'HYDRAULIC SYSTEM', parameter: 'HYD. CYLINDER', standard: 'Free from leakage, Mounting Looseness Check& Replace Oil seals during PM', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'HYDRAULIC SYSTEM', parameter: 'HYD. OIL HOSES', standard: 'Free from leakage, Looseness, interfere with Moving parts. Should be secured with clips on mould base in proper fashion. Strength rating of Hose pipe as per spec', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'HYDRAULIC SYSTEM', parameter: 'HYD. OIL COUPLERS / FITTINGS', standard: 'Free from damages, Looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'HYDRAULIC SYSTEM', parameter: 'HYD. CORE/SLIDE CONFIRM CONNECTOR', standard: 'Free from damage, loose wiring, oil, dust & should be in working condition', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'HYDRAULIC SYSTEM', parameter: 'LIMIT SWITCH / SENSORS', standard: 'Free from damage, loose wiring & should be in working condition', method: 'Visual / Manual/ Continuity check of Limit SW', status: 'NOT_OK', remark: '' },
        { area: 'HYDRAULIC SYSTEM', parameter: 'MOUNTING BOLTS', standard: 'Cylinder mounting bolt should not be damaged for CORE Insert holding. Sufficient thread enagements.', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'HYDRAULIC SYSTEM', parameter: 'STROKE LENGTH', standard: 'Stroke length to be sufficient for Core Insert OUT. At OUT position, Core Insert should not be hitting the Cylinder mounting plate', method: 'Core Slider movement', status: 'NOT_OK', remark: '' },
        { area: 'HYDRAULIC SYSTEM', parameter: 'General Check Point', standard: 'All Standard interfaces to be used, Not to extend beyond mould base', method: 'Standard Parts', status: 'NOT_OK', remark: '' }
      ]
    },
    {
      name: 'Cavity Side',
      items: [
        { area: 'CAVITY TEXTURE', parameter: 'CAVITY TEXTURE', standard: 'Free from rust, damages, dent, scratch', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'P.L / P.S', parameter: 'PARTING LINE', standard: 'Free from damages, rust, bulge, burrs . Spotting at Parting Line / matching areas/ Pressure pads', method: 'Visual / Manual, Red Paste', status: 'NOT_OK', remark: '' },
        { area: 'P.L / P.S', parameter: 'PROJECTION / PROFILES', standard: 'Check for crack and bend', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'P.L / P.S', parameter: 'PARTING/MATCHING SURFACES', standard: 'Free from damages, rust, bulge.', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'WELDING', parameter: 'WELDING', standard: 'Good condition / No crack / no pin hole', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'CHROME PLATED / MIRROR PLATED', parameter: 'CAVITY SURFACE', standard: 'Free from Scratches, dents, damages etc.,', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Heaters & TCs', standard: 'Heaters, Thermocouples in working conditions', method: 'HRTC Panel', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Resistance', standard: 'Resistance of Heaters , Thermocouples ( Note the actuals vs std & replace if out of spec )', method: 'Multimeter', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Leakages', standard: 'Remove Cavity Back plate & check suspected leakages & take countermeasure', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Pressure buttons', standard: 'Check the impression of Pressure buttons on Cavity plate ( No indentation should be there )', method: 'Visual , Depth Gauge', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Sequential Pipes', standard: 'No damage of pipes for cooling the sequential Cylinders. Thread fittings to be leak proof', method: 'Visual , Oil & Water connection', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Seals', standard: 'Check & Replace the Seals in cylinders', method: 'Actual', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Cu-Rings', standard: 'Replace Cu- Rings at top of Nozzle drop ( in case of YUDO H/R system )', method: 'Actual', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Nozzle rings', standard: 'Nozzle end ring to be tighten as per torque required (Mold master nozzles)', method: 'Torque Wrench', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Manifold Height', standard: 'Check the manifold height from the Mould Bolster surface', method: 'Height Gauge', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Valve pin', standard: 'No damage of valve pin. Verify Front angle as per drawing at pin functional area', method: 'Visual, Bevel / On Lathe', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Bolts', standard: 'Check the bolt condition & tighten as per torque required ( Refer Drawing ) at manifold area / others. Use 12.9 Class Bolts', method: 'Torque Wrench', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - Flow path', standard: 'Clean the H/R for flow path ( Manifold & Nozzle )', method: 'Heat & Air', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS SYSTEM - BOM parts', standard: 'All Standard parts used as per BOM', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HRS CONNECTOR', standard: 'Free from damage, looseness, loose wiring, oil, dust etc.,', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'HRS SYSTEM', parameter: 'HEAT INSULATOR PLATE', standard: 'Free from damage, loose mounting , Check for Thickness', method: 'Visual / Manual / Micro Meter', status: 'NOT_OK', remark: '' },
        { area: 'GENERAL CHECK POINT', parameter: 'Fasteners in all plates', standard: 'After tightening of each screw, confirmation mark should be done', method: 'Marker / visual', status: 'NOT_OK', remark: '' },
        { area: 'SEQ. VALVE SYSTEM', parameter: 'SOLENOID VALVE / AIR FITTINGS', standard: 'Free from damage, loose mounting, loose wiring', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'SEQ. VALVE SYSTEM', parameter: 'PNEUMATIC ACTUATION', standard: 'Smooth movement', method: 'Air pressure', status: 'NOT_OK', remark: '' },
        { area: 'SEQ. VALVE SYSTEM', parameter: 'AIR LEAKAGE', standard: 'No air leakage in Cylinder', method: 'Air pressure', status: 'NOT_OK', remark: '' },
        { area: 'SEQ. VALVE SYSTEM', parameter: 'WATER LEAKAGE', standard: 'No water leakage in fittings', method: 'Water pressure', status: 'NOT_OK', remark: '' },
        { area: 'SEQ. VALVE SYSTEM', parameter: 'O-RING SET', standard: 'Check & Relace during PM as per Mould Drawing spec', method: 'Actual', status: 'NOT_OK', remark: '' },
        { area: 'SEQ. VALVE SYSTEM', parameter: 'FILTER / BREATHER', standard: 'No blockage / Must be cleaned by Air', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'AIR VENTS', parameter: 'AIR VENTS', standard: 'Free from damages, rust, dust', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'GAS INJECTION', parameter: 'AIR PIPE FITTINGS', standard: 'Free from damages, Looseness, dust', method: 'Visual/Manual', status: 'NOT_OK', remark: '' },
        { area: 'SPRUE BUSH', parameter: 'COLD SPRUE BUSH', standard: 'Free from scoring, damages, crack, bolt looseness', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'SPRUE BUSH', parameter: 'NOZZLE TOUCH BUSH RADIUS', standard: 'Free from damage, surface roughness. Radius as per standard recommended', method: 'Visual , Radius Gauge', status: 'NOT_OK', remark: '' }
      ]
    },
    {
      name: 'Sliders',
      items: [
        { area: 'SLIDER PARTS', parameter: 'CAM PINS', standard: 'Free from scoring, bend, damages, looseness/play & apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: '(1) SIDE CORE SCUFFING', standard: 'No scuffing', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: '(2) GUIDE RAILS', standard: 'No scuffing', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: '(3) GUIDE RAIL ASSEMBLY', standard: 'No bolt loose / No bolt missing / Free movement / apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: 'WORKING SMOOTHLY', standard: 'By hand, Free movement', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: 'SPRING CONDITION', standard: 'Check Tension', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: 'SPRING LOAD', standard: 'Must return the Slider', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: '(5) SPRING', standard: 'No Full Compression', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: '(6) STOPPER', standard: 'Side core must touch the stopper', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: 'WEDGES', standard: 'Free from damages, scoring, looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: '(7) WEAR PLATES', standard: 'Free from damages, scoring, bolt missing & apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'SPRING HOLDING PLATE', parameter: 'SPRING HOLDING PLATE', standard: 'Free from looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'SPRING BOLTS', parameter: 'SPRING BOLTS', standard: 'Free from looseness, bend', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'BALL CATCHERS', parameter: 'BALL CATCHERS', standard: 'Free from damages, jam etc', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDER PARTS', parameter: 'General check Point', standard: 'Finger Cam should take the slider to Ball catcher position upto Stopper bolt', method: 'Visually by mould opening', status: 'NOT_OK', remark: '' }
      ]
    },
    {
      name: 'Core Side',
      items: [
        { area: 'CORE SURFACE', parameter: 'CORE SURFACE /', standard: 'Free from rust, damages, bulging etc., & Level of Ejector Parts found normal from Core surface', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'PARTING LINE', parameter: 'PARTING LINE', standard: 'Free from damages, rust, bulging etc.', method: 'Visual', status: 'NOT_OK', remark: '' },
        { area: 'AIR VENTS', parameter: 'AIR VENTS', standard: 'Free from damages, rust, clog', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'CORE PINS', parameter: 'CORE PINS / INSERTS', standard: 'Free from scoring, bend, damages, loose fitment etc.,', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'EJECTOR PIN / SLEEVE PINS', standard: 'Free from scoring, dust, bend, tight movement & apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'EJECTOR BLADES', standard: 'Free from scoring, dust, bend, tight movement & apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'EJECTOR PAD / BLOCKS & SHAFTS', standard: 'Free from scoring, bend, tight movement & apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'ANGULAR CORE & SHAFTS', standard: 'Free from scoring, bend, tight movement & apply grease. Lubrication grooves on rod / shaft. Spotting in Lifter Pocket & Lifter, Lifter Rod Length spotting', method: 'Visual / Manual / RED Paste', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: '(1) ROD SCUFFING', standard: 'Check Looseness when Ejection Out', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: '(2) HOLE', standard: 'No scuffing', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'ASSEMBLY', standard: 'No dowel and bush looseness', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: '(3) DOWEL PIN', standard: 'Must not fall off', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: '(4) BUSH', standard: 'No scuffing', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: '(5) GUIDE RAIL', standard: 'No scuffing', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: '(6) ANGULARE CORE HOLDER', standard: 'Proper fitment', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: '(7) BOLTS', standard: 'No loose lifter bolts. No wear of threads. Provision of NORDLOCK / equivalent washer for anti-looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: '(8) SLIDE SURFACE', standard: 'No scuffing', method: 'Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'RETURN PINS', standard: 'Free from scoring, bend, tight movement & apply grease. Spotting at Return Pins face', method: 'Visual / Manual / RED Paste', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'ALL EJ. PIN / BLADE / SHAFT HOLES', standard: 'Free from scoring, rust, damages, dust etc.,', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: "LIFTER'S GUIDE BUSH in CORE BLOCK", standard: 'Check for its position and lock plate fixed/bolted', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'EJECTOR GUIDE PILLAR', standard: 'Free from scoring, bend, dry surface, tight movement & apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'EJECTOR GUIDE BUSH', standard: 'Free from scoring, crack, dry surface, tight movement & apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'SUPPORT BLOCKS', standard: 'Free from damages, scoring, looseness', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR SYSTEM', parameter: 'EJECTOR MOVEMENT', standard: 'Check the Ejector Grid movement prior to PM closure', method: 'POWER PACK for Hydraulic, CRANE (Spring removed)', status: 'NOT_OK', remark: '' },
        { area: 'GENERAL CHECK POINT', parameter: 'Fasteners in all plates', standard: 'After tightening of each screw, confirmation mark should be done', method: 'Marker / visual', status: 'NOT_OK', remark: '' },
        { area: 'SLIDE UNITS FOR ANGULAR CORE SHAFT', parameter: 'SLIDE UNITS FOR ANGULAR CORE SHAFT', standard: 'Free from tight movement, dust, bolt looseness & apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR CONFIRMATION', parameter: 'EJ. CONFIRM LIMIT SWITCH', standard: 'Free from damage, looseness, mis-position & should be in working condition. Wiring to be insulated from mould body', method: 'Visual / Manual, Continuity check of Limit SW', status: 'NOT_OK', remark: '' },
        { area: 'EJECTOR CONFIRMATION', parameter: 'EJ. CONFIRMATION CONNECTOR', standard: 'Check for its working condition, no loose wiring', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'UNSCREWING MECHANISM', parameter: 'UNSCREWING MECHANISM', standard: 'Check for teeth damage, loose alignment & apply grease', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'RETURN SPRINGS', parameter: 'RETURN SPRINGS', standard: 'Free from damages, mis-alignment, tensionless', method: 'Visual / Manual', status: 'NOT_OK', remark: '' },
        { area: 'GAS SPRINGS', parameter: 'GAS SPRINGS', standard: 'Free from damages, mis-location, bolt looseness & Check for tension', method: 'Visual / Manual', status: 'NOT_OK', remark: '' }
      ]
    }
  ];

  // PM Preparation Modal
  showPMPrepModal: boolean = false;
  pmPrepItems = [
    {
      id: '1',
      description: 'Hand Gloves,Safety Glasses, Helmet,Safety Shoes,Ear Plug,Mask :',
      standard: 'All safety PPEs should be available',
      status: 'NOT_OK',
      remark: ''
    },
    {
      id: '2',
      description: 'Inspection of last moulded part with runner & sprue & Loading Unloading check sheet',
      standard: 'Should be available with marking at problematic areas',
      status: 'NOT_OK',
      remark: ''
    },
    {
      id: '2.1',
      description: 'Inspection of last moulded part with runner & sprue & Loading Unloading check sheet (Regulatory/Other markings)',
      standard: 'Regulatory marking / Other marking should be available, clearly visible on part as per specification sheet',
      status: 'NOT_OK',
      remark: ''
    },
    {
      id: '3',
      description: 'Last Part Inspection Report with detailed feedback from quality regarding part quality & Regulatory marking/Other marking condition on part',
      standard: 'Should be available and all concern points should be updated in Report',
      status: 'NOT_OK',
      remark: ''
    },
    {
      id: '3.1',
      description: 'Last Part Inspection Report with detailed feedback from quality regarding part quality & Regulatory marking/Other marking condition on part (Regulatory/Other markings)',
      standard: 'Regulatory marking/Other marking condition should be OK',
      status: 'NOT_OK',
      remark: ''
    },
    {
      id: '4',
      description: 'Mould History card-To check problem history/Last six month .',
      standard: 'Should be available and updated',
      status: 'NOT_OK',
      remark: ''
    },
    {
      id: '5',
      description: 'Mould Loading Unloading Check Sheet',
      standard: 'Latest Check Sheet should be available and updated',
      status: 'NOT_OK',
      remark: ''
    },
    {
      id: '6',
      description: 'Spare parts availability / Spare part detail availability',
      standard: 'Should be available',
      status: 'NOT_OK',
      remark: ''
    },
    {
      id: '7',
      description: 'Special Characteristics sheet point to be verify',
      standard: 'Should be available & updated',
      status: 'NOT_OK',
      remark: ''
    },
    {
      id: '8',
      description: "Mould history / part qa/ gca/ rba/customer's specific requirements ( if any )",
      standard: 'Should be available and updated',
      status: 'NOT_OK',
      remark: ''
    }
  ];

  // PM Prep Remarks Popup
  showPMPrepRemarksPopup: boolean = false;
  activePMPrepRemarkItem: any = null;
  tempPMPrepRemark: string = '';

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    let relativePath = imagePath;
    const mediaIdx = imagePath.indexOf('/media/');
    if (mediaIdx > -1) {
      relativePath = imagePath.substring(mediaIdx);
    }
    return this.intimationService.baseUrl + relativePath;
  }

  constructor(
    private intimationService: IntimationService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.actionData.broken_parts = [this.createNewBrokenPart()];
    this.actionData.spares_consumed = [this.createNewSpare()];
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['toolCode']) {
        this.scannerInput = params['toolCode'];
        // Small delay to ensure view rendering has begun before dispatching onSend
        setTimeout(() => {
          this.onSend();
        }, 100);
      }
    });
  }

  ngAfterViewInit() {
    this.focusInput();
  }

  focusInput() {
    if (this.scannerInputField) {
      setTimeout(() => {
        this.scannerInputField.nativeElement.focus();
      }, 0);
    }
  }

  showSlip() {
    this.visibleSlip = true;
  }

  openAddPMPlan() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    this.newPMPlan = {
      tool_code: this.toolInfo?.tool_code || '',
      planned_date: yyyy + '-' + mm + '-' + dd,
      customer: 'MATE',
      machine_tonnage: '',
      req_hours: null,
      remark: ''
    };
    this.showAddPMPlanModal = true;
  }

  submitPMPlan() {
    if (!this.newPMPlan.planned_date) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'Planned Date is required.'
      });
      return;
    }

    this.intimationService.addPMScheduleManual(this.newPMPlan).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'PM Plan added successfully.'
        });
        this.showAddPMPlanModal = false;
        window.location.reload();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.error || 'Failed to add PM Plan.'
        });
      }
    });
  }

  onSend() {
    if (!this.scannerInput.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter a tool code.',
      });
      return;
    }

    this.loading = true;
    this.intimationService.getToolInfo(this.scannerInput.trim()).subscribe({
      next: (res) => {
        this.toolInfo = res;
        this.showDetails = true;
        this.loading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Tool Found',
          detail: `Information for ${this.scannerInput} loaded.`,
        });
        this.scannerInput = ''; // Clear input on success
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to fetch tool information.',
        });
        this.scannerInput = ''; // Clear input on error
        this.showDetails = false;
        this.loading = false;
        this.focusInput();
      },
    });
  }

  get isPMCheckin(): boolean {
    return this.toolInfo?.suggested_action === 'CHECK_IN_PM' || 
           (this.toolInfo?.suggested_action === 'CHECK_IN' && this.toolInfo?.session_info?.session_type === 'PM');
  }

  onCheckIn() {
    if (this.isPMCheckin) {
      this.openPMPrepModal();
    } else {
      this.performDirectCheckIn();
    }
  }

  openPMPrepModal() {
    this.pmPrepItems.forEach(item => {
      item.status = 'NOT_OK';
      item.remark = '';
    });
    this.showPMPrepModal = true;
  }

  openPMPrepRemark(item: any) {
    this.activePMPrepRemarkItem = item;
    this.tempPMPrepRemark = item.remark || '';
    this.showPMPrepRemarksPopup = true;
  }

  savePMPrepRemark() {
    if (this.activePMPrepRemarkItem) {
      this.activePMPrepRemarkItem.remark = this.tempPMPrepRemark;
    }
    this.showPMPrepRemarksPopup = false;
    this.activePMPrepRemarkItem = null;
    this.tempPMPrepRemark = '';
  }

  cancelPMPrepRemark() {
    this.showPMPrepRemarksPopup = false;
    this.activePMPrepRemarkItem = null;
    this.tempPMPrepRemark = '';
  }

submitPMPrepCheckin() {
    const payload = {
      tool: this.toolInfo.tool_code,
      category: 'PM', // Routes directly to the backend PM logic path
      session_id: this.toolInfo.session_id || this.toolInfo.session_info?.session_id || null,
      slip_id: this.toolInfo.slip_id || null,
      pm_preparation: this.pmPrepItems.map(item => ({
        id: item.id,
        description: item.description,
        standard: item.standard,
        status: item.status,
        remark: item.remark
      }))
    };

    this.loading = true;
    this.intimationService.checkInTool(payload).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message || 'PM Check-in successful.',
        });
        
        // Dynamically bind keys generated on the fly by backend mapping templates
        if (this.toolInfo) {
          this.toolInfo.session_id = res.session_id;
          this.toolInfo.slip_id = res.slip_id;
        }

        this.showPMPrepModal = false;
        this.loading = false;
        this.resetPage();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.error || 'PM Check-in failed.',
        });
        this.loading = false;
      },
    });
  }

  performDirectCheckIn() {
    const payload = {
      tool: this.toolInfo.tool_code,
      category: 'BM', // Routes to the backend Breakdown logic path
      session_id: this.toolInfo.session_id || this.toolInfo.session_info?.session_id || null,
      slip_id: this.toolInfo.slip_id || null,
    };

    this.loading = true;
    this.intimationService.checkInTool(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message || 'Check-in successful.',
        });
        this.loading = false;
        this.resetPage();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Breakdown Check-in failed.',
        });
        this.loading = false;
      },
    });
  }

  onImageSelect(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    // Validate size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'File Too Large',
        detail: 'Image size must be less than 5MB.'
      });
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Invalid Format',
        detail: 'Only .jpeg, .jpg, and .png formats are allowed.'
      });
      return;
    }

    this.messageService.add({ severity: 'info', summary: 'Uploading...', detail: 'Please wait' });
    this.intimationService.uploadToolImage(this.toolInfo.tool_code, file).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Complete',
          detail: 'Tool image updated successfully.'
        });
        
        // Refresh the tool info to get the new image URL (or use a returned URL)
        this.intimationService.getToolInfo(this.toolInfo.tool_code).subscribe(newInfo => {
          this.toolInfo = newInfo;
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'Could not upload the image.'
        });
      }
    });
  }

  onChecksheetSelect(event: any, type: string) {
    const file = event.target.files[0];
    if (!file || !this.toolInfo?.pm_schedule_info?.id) return;

    this.loading = true;
    this.intimationService.uploadPMSchecksheet(this.toolInfo.pm_schedule_info.id, type, file).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Success',
          detail: res.message || `${type} checksheet uploaded successfully.`
        });
        this.loading = false;
        this.refreshToolInfo();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: err.error?.error || 'Failed to upload checksheet file.'
        });
        this.loading = false;
      }
    });
  }

  onChecksheetRemove(type: string) {
    if (!this.toolInfo?.pm_schedule_info?.id) return;

    this.loading = true;
    this.intimationService.deletePMSchecksheet(this.toolInfo.pm_schedule_info.id, type).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Removed Successfully',
          detail: res.message || `${type} checksheet removed successfully.`
        });
        this.loading = false;
        this.refreshToolInfo();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Remove Failed',
          detail: err.error?.error || 'Failed to remove checksheet file.'
        });
        this.loading = false;
      }
    });
  }

  refreshToolInfo() {
    if (!this.toolInfo?.tool_code) return;
    this.loading = true;
    this.intimationService.getToolInfo(this.toolInfo.tool_code).subscribe({
      next: (res) => {
        this.toolInfo = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to refresh tool info:', err);
        this.loading = false;
      }
    });
  }

  onCheckOut() {
    if (this.toolInfo?.session_info?.session_type === 'PM') {
      this.openPMChecksheet();
    } else {
      this.fetchChecklist();
    }
  }

  fetchChecklist() {
    this.intimationService
      .getChecklistTemplate(this.toolInfo.tool_code)
      .subscribe({
        next: (res) => {
          this.checklistData = res;
          this.checklistSource = res.checklist_source;
          // Ensure observation is set
          if (this.checklistData.check_items) {
            this.checklistData.check_items.forEach((item: any) => {
              if (!item.observation) item.observation = 'OK';
            });
          }
          this.showChecklistModal = true;
          this.messageService.add({
            severity: 'info',
            summary: 'Checklist Ready',
            detail: 'Please complete the inspection items.',
          });
        },error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch checklist.',
          });
        }
      });
  }

  onObservationChange(item: any, value: string) {
    item.observation = value;
    if (value === 'NOT_OK') {
      this.activeRemarkItem = item;
      this.tempRemark = item.remarks || '';
      this.showRemarksPopup = true;
    }
  }

  saveRemark() {
    if (this.activeRemarkItem) {
      this.activeRemarkItem.remarks = this.tempRemark;
    }
    this.showRemarksPopup = false;
    this.activeRemarkItem = null;
    this.tempRemark = '';
  }

  cancelRemark() {
    if (this.activeRemarkItem) {
      // Revert to OK if user cancels without entering a remark
      this.activeRemarkItem.observation = 'OK';
    }
    this.showRemarksPopup = false;
    this.activeRemarkItem = null;
    this.tempRemark = '';
  }

  initPMActionData() {
    this.pmActionData = {
      corrective_actions: [this.createNewPMCorrectiveRow()],
      spares_consumed: [this.createNewPMSpareRow()],
      kaizen_problem_status: '',
      kaizen_countermeasure: ''
    };
    this.kaizenBeforeFile = null;
    this.kaizenAfterFile = null;
    this.kaizenBeforePreview = null;
    this.kaizenAfterPreview = null;

    if (!this.sparesLoaded) {
      this.loadSpares();
    }
  }

  createNewPMCorrectiveRow() {
    return {
      problem_observed: '',
      correction: '',
      corrective_action: '',
      status: ''
    };
  }

  createNewPMSpareRow() {
    return {
      itemcode: '',
      description: '',
      finished_size: '',
      quantity: null,
      remarks: ''
    };
  }

  onPMSpareSelect(event: any, row: any) {
    const selectedItem = this.sparesList.find(s => s.itemcode === event.value);
    if (selectedItem) {
      row.description = selectedItem.partName;
      row.itemcode = selectedItem.itemcode;
    } else {
      row.description = '';
      row.itemcode = '';
    }
  }

  clearKaizenBeforeImage() {
    this.kaizenBeforeFile = null;
    this.kaizenBeforePreview = null;
    if (this.beforeImageInput) {
      this.beforeImageInput.nativeElement.value = '';
    }
  }

  clearKaizenAfterImage() {
    this.kaizenAfterFile = null;
    this.kaizenAfterPreview = null;
    if (this.afterImageInput) {
      this.afterImageInput.nativeElement.value = '';
    }
  }

  addPMCorrectiveRow() {
    this.pmActionData.corrective_actions.push(this.createNewPMCorrectiveRow());
  }

  removePMCorrectiveRow(idx: number) {
    this.pmActionData.corrective_actions.splice(idx, 1);
  }

  addPMSpareRow() {
    this.pmActionData.spares_consumed.push(this.createNewPMSpareRow());
  }

  removePMSpareRow(idx: number) {
    this.pmActionData.spares_consumed.splice(idx, 1);
  }

  onKaizenBeforeImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.kaizenBeforeFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.kaizenBeforePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onKaizenAfterImageSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.kaizenAfterFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.kaizenAfterPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  proceedToActionModal() {
    const isPM = this.toolInfo?.session_info?.session_type === 'PM';
    if (isPM) {
      this.showPMChecksheetModal = false;
      this.initPMActionData();
      this.showPMActionModal = true;
    } else {
      this.showChecklistModal = false;
      this.openActionModal();
    }
  }

  submitPMCheckOut() {
    this.submittingCheckOut = true;

    const validCorrectiveActions = this.pmActionData.corrective_actions.filter(
      (r: any) => r.problem_observed || r.correction || r.corrective_action || r.status
    );
    const validSpares = this.pmActionData.spares_consumed.filter(
      (s: any) => s.description || s.finished_size || s.quantity > 0
    );

    const formData = new FormData();
    formData.append('session_id', this.toolInfo.session_id || this.toolInfo.session_info?.session_id || '');
    formData.append('slip_id', this.toolInfo.slip_id || '');
    formData.append('corrective_action_summary', JSON.stringify(validCorrectiveActions));
    formData.append('spares_consumed', JSON.stringify(validSpares));
    formData.append('kaizen_problem_status', this.pmActionData.kaizen_problem_status || '');
    formData.append('kaizen_countermeasure', this.pmActionData.kaizen_countermeasure || '');

    if (this.kaizenBeforeFile) {
      formData.append('kaizen_before_image', this.kaizenBeforeFile);
    }
    if (this.kaizenAfterFile) {
      formData.append('kaizen_after_image', this.kaizenAfterFile);
    }

    this.intimationService.submitActionUpdate(formData).subscribe({
      next: (res: any) => {
        this.submittingCheckOut = false;
        let successMsg = 'PM Verification Completed successfully.';
        if (res.pm_schedule_status === 'IN_PROCESS_CHECK_PENDING') {
          successMsg = 'PM checked out. Please upload the In-Process Checksheet to complete.';
        }
        this.messageService.add({
          severity: res.pm_schedule_status === 'IN_PROCESS_CHECK_PENDING' ? 'warn' : 'success',
          summary: 'Success',
          detail: successMsg,
        });
        this.showPMActionModal = false;
        this.resetPage();
      },
      error: (err) => {
        this.submittingCheckOut = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.error || 'Failed to submit PM action update.',
        });
      }
    });
  }

  openActionModal() {
    this.showActionModal = true;
  }

  createNewBrokenPart() {
    return {
      mold_part_name: '',
      pole_no: '',
      part_number: '',
      cavity_no: '',
      total_parts_broken: null,
    };
  }

  addBrokenPart() {
    this.actionData.broken_parts.push(this.createNewBrokenPart());
  }

  removeBrokenPart(index: number) {
    if (this.actionData.broken_parts.length > 1) {
      this.actionData.broken_parts.splice(index, 1);
    }
  }

  createNewSpare() {
    return {
      itemcode: null,
      quantity: null,
    };
  }

  addSpare() {
    this.actionData.spares_consumed.push(this.createNewSpare());
  }

  removeSpare(index: number) {
    if (this.actionData.spares_consumed.length > 1) {
      this.actionData.spares_consumed.splice(index, 1);
    }
  }

  onActionTabChange(value: any) {
    if ((value === '1' || value === 1) && !this.sparesLoaded) {
      this.loadSpares();
    }
  }

  loadSpares() {
    this.intimationService.getSpares().subscribe({
      next: (res: any) => {
        console.log('Spares loaded:', res);
        this.sparesList = Array.isArray(res) ? res : (res?.data || res?.spares || res?.message || []);
        this.sparesLoaded = true;
      },
      error: (err) => {
        console.error('Error fetching spares:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load spares list.',
        });
      }
    });
  }

  onMarkingSheetSelect(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.markingSheetFile = file;
    }
  }

  clearMarkingSheet() {
    this.markingSheetFile = null;
    if (this.markingSheetInput && this.markingSheetInput.nativeElement) {
      this.markingSheetInput.nativeElement.value = '';
    }
  }

submitCombinedCheckOut() {
    const isPM = this.toolInfo?.session_info?.session_type === 'PM' || this.toolInfo?.suggested_action === 'CHECK_OUT' && !this.toolInfo?.slip_id;

    // Validate main action text elements
    const { inspection_remarks, repaired_by, problem_cause, corrective_action } = this.actionData;
    if (!inspection_remarks?.trim() || !repaired_by?.trim() || !problem_cause?.trim() || !corrective_action?.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Required Fields',
        detail: 'Please fill in all the required text fields.',
      });
      return;
    }

    // Enforce broken parts marking sheets strictly during Breakdown Maintenance (BM) mode
    if (!isPM && !this.markingSheetFile) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Required',
        detail: 'Please upload the Breakdown Marking Sheet before submitting.',
      });
      return;
    }

    this.submittingCheckOut = true;

    const validBrokenParts = this.actionData.broken_parts.filter((p: any) => p.part_number && p.mold_part_name);
    const validSpares = this.actionData.spares_consumed.filter((s: any) => s.itemcode && s.quantity > 0);

    const actionPayload = {
      slip_id: this.toolInfo.slip_id || '',
      session_id: this.toolInfo.session_id || this.toolInfo.session_info?.session_id || '',
      inspection_remarks: this.actionData.inspection_remarks,
      repaired_by: this.actionData.repaired_by,
      problem_cause: this.actionData.problem_cause,
      corrective_action: this.actionData.corrective_action,
      broken_parts: validBrokenParts,
      spares_consumed: validSpares,
      five_whys: {
        why1: this.actionData.why1 || '',
        why2: this.actionData.why2 || '',
        why3: this.actionData.why3 || '',
        why4: this.actionData.why4 || '',
        why5: this.actionData.why5 || ''
      }
    };

    const runActionUpdate = () => {
      this.intimationService.submitActionUpdate(actionPayload).subscribe({
        next: (res: any) => {
          this.submittingCheckOut = false;
          let successMsg = isPM ? 'PM Verification Completed successfully.' : 'Check-out completed successfully.';
          if (isPM && res.pm_schedule_status === 'IN_PROCESS_CHECK_PENDING') {
            successMsg = 'PM checked out. Please upload the In-Process Checksheet to complete.';
          }
          this.messageService.add({
            severity: isPM && res.pm_schedule_status === 'IN_PROCESS_CHECK_PENDING' ? 'warn' : 'success',
            summary: 'Success',
            detail: successMsg,
          });
          this.showActionModal = false;
          this.resetPage();
        },
        error: (err) => {
          this.submittingCheckOut = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.error || 'Failed to submit action update specifications.',
          });
        }
      });
    };

    // If it is PM, skip redundant breakdown checklist updates entirely since PM checksheet is already saved
    if (isPM) {
      runActionUpdate();
    } else {
      const checklistPayload = new FormData();
      checklistPayload.append('slip_id', this.toolInfo.slip_id || '');
      checklistPayload.append('session_id', this.toolInfo.session_id || '');
      
      const checklistItems = this.checklistData.check_items
        .filter((item: any) => item.observation !== 'NA')
        .map((item: any) => ({
          item_name: item.check_item,
          observation: item.observation,
          remarks: item.remarks || '',
        }));
      
      checklistPayload.append('checklist', JSON.stringify(checklistItems));
      if (this.markingSheetFile) {
        checklistPayload.append('sheet', this.markingSheetFile);
      }

      this.intimationService.submitChecklist(checklistPayload).subscribe({
        next: () => {
          runActionUpdate();
        },
        error: () => {
          this.submittingCheckOut = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to submit validation verification checklist data items.',
          });
        }
      });
    }
  }
  openPMChecksheet() {
    this.activePMTab = '0';
    this.pmChecksheetCategories.forEach(cat => {
      cat.items.forEach(item => {
        item.status = 'NOT_OK';
        item.remark = '';
      });
    });
    this.showPMChecksheetModal = true;
  }

  openPMChecksheetRemark(item: any) {
    this.activePMChecksheetRemarkItem = item;
    this.tempPMChecksheetRemark = item.remark || '';
    this.showPMChecksheetRemarksPopup = true;
  }

  savePMChecksheetRemark() {
    if (this.activePMChecksheetRemarkItem) {
      this.activePMChecksheetRemarkItem.remark = this.tempPMChecksheetRemark;
    }
    this.showPMChecksheetRemarksPopup = false;
    this.activePMChecksheetRemarkItem = null;
    this.tempPMChecksheetRemark = '';
  }

  cancelPMChecksheetRemark() {
    this.showPMChecksheetRemarksPopup = false;
    this.activePMChecksheetRemarkItem = null;
    this.tempPMChecksheetRemark = '';
  }

  submitPMChecksheet() {
    const flattenedItems: any[] = [];
    this.pmChecksheetCategories.forEach(cat => {
      cat.items.forEach(item => {
        flattenedItems.push({
          category: cat.name,
          area: item.area,
          parameter: item.parameter,
          standard: item.standard,
          method: item.method,
          status: item.status,
          remark: item.remark || ''
        });
      });
    });

    this.loading = true;
    this.intimationService.submitPMChecksheet({
      session_id: this.toolInfo.session_id || this.toolInfo.session_info?.session_id,
      slip_id: this.toolInfo.slip_id,
      checklist: JSON.stringify(flattenedItems)
    }).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Check Sheet Saved',
          detail: 'Mould PM Check Sheet submitted successfully.'
        });
        this.showPMChecksheetModal = false;
        this.loading = false;
        this.proceedToActionModal();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Submission Failed',
          detail: err.error?.error || 'Failed to submit PM Check Sheet.'
        });
        this.loading = false;
      }
    });
  }

  resetPage() {
    this.scannerInput = '';
    this.showDetails = false;
    this.toolInfo = null;
    this.clearMarkingSheet();
    this.sparesLoaded = false;
    this.activeActionTabIndex = '0';
    this.loading = false;
    this.actionData = {
      inspection_remarks: '',
      repaired_by: '',
      problem_cause: '',
      corrective_action: '',
      broken_parts: [this.createNewBrokenPart()],
      spares_consumed: [this.createNewSpare()],
      why1: '',
      why2: '',
      why3: '',
      why4: '',
      why5: '',
    };
    this.focusInput();
  }

  downloadChecksheet() {
    if (this.toolInfo?.last_pm_checksheet) {
        window.open(this.toolInfo.last_pm_checksheet, '_blank');
    }
  }

  openBDInspectionDialog() {
    this.bdInspectionData = { breakdown_type: 'MAJOR', remarks: '' };
    this.showBDInspectionModal = true;
  }

  submitBDInspection() {
    const slipId = this.toolInfo.slip_id || this.toolInfo.session_info?.slip_id;
    if (!slipId) return;
    this.loading = true;
    this.intimationService.inspectBreakdown(slipId, this.bdInspectionData.breakdown_type, this.bdInspectionData.remarks).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message || 'Breakdown inspection recorded.'
        });
        this.showBDInspectionModal = false;
        this.resetPage();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.error || 'Inspection submission failed.'
        });
        this.loading = false;
      }
    });
  }

  openMinorCloseDialog() {
    this.minorCloseData = { 
      inspection_remarks: '', 
      corrective_action: '', 
      repaired_by: '',
      spares_consumed: [this.createNewSpare()]
    };
    if (!this.sparesLoaded) {
      this.loadSpares();
    }
    this.showMinorCloseModal = true;
  }

  addMinorCloseSpare() {
    this.minorCloseData.spares_consumed.push(this.createNewSpare());
  }

  removeMinorCloseSpare(index: number) {
    if (this.minorCloseData.spares_consumed.length > 1) {
      this.minorCloseData.spares_consumed.splice(index, 1);
    }
  }

  submitMinorClose() {
    const slipId = this.toolInfo.slip_id || this.toolInfo.session_info?.slip_id;
    if (!slipId) return;

    // Filter out invalid/empty spares
    const validSpares = this.minorCloseData.spares_consumed.filter(
      (s: any) => s.itemcode && s.quantity > 0
    );

    this.loading = true;
    this.intimationService.closeMinorBreakdown(
      slipId,
      this.minorCloseData.inspection_remarks,
      this.minorCloseData.corrective_action,
      this.minorCloseData.repaired_by,
      validSpares
    ).subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: res.message || 'Minor breakdown closed.'
        });
        this.showMinorCloseModal = false;
        this.resetPage();
      },
      error: (err: any) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.error || 'Failed to close minor breakdown.'
        });
        this.loading = false;
      }
    });
  }
}
