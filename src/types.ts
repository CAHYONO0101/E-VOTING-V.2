export interface Candidate {
  id: string;
  noUrut: number;
  nama: string;
  panggilan: string;
  fotoUrl: string;
  visi: string;
  misi: string[];
  jumlahSuara: number;
}

export interface DPTMember {
  id: string;
  nik: string;
  nama: string;
  rtRw: string;
  hasVoted: boolean;
  votedAt?: string;
}

export interface DeviceRecord {
  deviceId: string;
  fingerprintHash: string;
  ip: string;
  nik: string;
  votedAt: string;
}

export interface OrgInfo {
  code: string;
  name: string;
  title: string;
  subtitle: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  totalDpt: number;
  totalVotes: number;
  createdAt?: string;
}

export interface ElectionData {
  orgCode: string;
  orgName: string;
  title: string;
  subtitle: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  candidates: Candidate[];
  dpt: DPTMember[];
  votedDevices: DeviceRecord[];
  totalDpt: number;
  totalVotes: number;
  participationRate: number;
  lastUpdated: string;
  allOrgs?: OrgInfo[];
}

export interface VotePayload {
  nik: string;
  candidateId: string;
  deviceId: string;
  fingerprintHash: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}
