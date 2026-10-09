import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Cloud, 
  Database, 
  Server, 
  Code2, 
  FileText,
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { IS_AWS_CONNECTED, AWS_API_BASE_URL } from '../services/api';

interface AwsSamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAM_TEMPLATE_YAML = `AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  FloodLens - Street-Level Flood Intelligence Platform
  Backend Serverless Stack for WeMakeDevs Bharat Builds Environmental Hacks

Globals:
  Function:
    Timeout: 10
    MemorySize: 256
    Runtime: nodejs20.x
    Architectures:
      - arm64
    Environment:
      Variables:
        TABLE_NAME: !Ref FloodIncidentsTable
        PHOTO_BUCKET: !Ref FloodEvidenceBucket

Resources:
  # 1. API Gateway HTTP API
  FloodLensHttpApi:
    Type: AWS::Serverless::HttpApi
    Properties:
      CorsConfiguration:
        AllowMethods:
          - GET
          - POST
          - PUT
          - OPTIONS
        AllowHeaders:
          - Content-Type
          - Authorization
        AllowOrigins:
          - '*'

  # 2. Serverless Function: Get Active Incidents with Spatial Filters
  GetIncidentsFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/backend/
      Handler: incidents.getHandler
      Events:
        GetIncidents:
          Type: HttpApi
          Properties:
            Path: /api/v1/incidents
            Method: get
            ApiId: !Ref FloodLensHttpApi
      Policies:
        - DynamoDBReadPolicy:
            TableName: !Ref FloodIncidentsTable

  # 3. Serverless Function: Submit Crowdsourced Flood Report & Score
  SubmitReportFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/backend/
      Handler: reports.submitHandler
      Events:
        SubmitReport:
          Type: HttpApi
          Properties:
            Path: /api/v1/reports
            Method: post
            ApiId: !Ref FloodLensHttpApi
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref FloodIncidentsTable

  # 4. Serverless Function: Corroborate Incident (+1 TrustScore)
  CorroborateReportFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/backend/
      Handler: reports.corroborateHandler
      Events:
        CorroborateReport:
          Type: HttpApi
          Properties:
            Path: /api/v1/reports/{id}/corroborate
            Method: post
            ApiId: !Ref FloodLensHttpApi
      Policies:
        - DynamoDBCrudPolicy:
            TableName: !Ref FloodIncidentsTable

  # 5. DynamoDB Table with GeoHash partition key and TTL automated decay
  FloodIncidentsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: FloodLensIncidents
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: PK
          AttributeType: S
        - AttributeName: SK
          AttributeType: S
        - AttributeName: City
          AttributeType: S
        - AttributeName: Timestamp
          AttributeType: N
      KeySchema:
        - AttributeName: PK
          KeyType: HASH
        - AttributeName: SK
          KeyType: RANGE
      GlobalSecondaryIndexes:
        - IndexName: CityIndex
          KeySchema:
            - AttributeName: City
              KeyType: HASH
            - AttributeName: Timestamp
              KeyType: RANGE
          Projection:
            ProjectionType: ALL
      TimeToLiveSpecification:
        AttributeName: ExpireAt
        Enabled: true

  # 6. S3 Bucket for Crowdsourced Flood Evidence
  FloodEvidenceBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub 'floodlens-evidence-\${AWS::AccountId}-\${AWS::Region}'
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true

Outputs:
  ApiEndpoint:
    Description: HTTP API Gateway Endpoint URL
    Value: !Sub 'https://\${FloodLensHttpApi}.execute-api.\${AWS::Region}.amazonaws.com'
`;

export const AwsSamModal: React.FC<AwsSamModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'template' | 'export_steps'>('architecture');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SAM_TEMPLATE_YAML);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                AWS SAM CLI Serverless Architecture & Source Export
              </h3>
              <p className="text-xs text-slate-500">
                Decoupled cloud architecture ready for AWS Lambda, API Gateway & DynamoDB deployment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-5 pt-3 border-b border-slate-100 bg-white text-xs">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-2 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'architecture'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Architecture & Integration Status
          </button>
          <button
            onClick={() => setActiveTab('template')}
            className={`pb-2.5 px-2 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'template'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            AWS SAM template.yaml
          </button>
          <button
            onClick={() => setActiveTab('export_steps')}
            className={`pb-2.5 px-2 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'export_steps'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Export Source Code & Local Run
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              {/* Integration Status Notice */}
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/50 flex items-start gap-3 text-xs">
                <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-teal-950 text-sm">
                    Transparent Technical Status: Reactive Frontend Mode
                  </h4>
                  <p className="text-teal-800 mt-1 leading-relaxed">
                    Per hackathon competition standards, this application runs with zero paid cloud dependencies out of the box using a high-fidelity client data layer (`src/services/api.ts`). The AWS SAM CLI serverless stack is fully defined and architected below, ready for deployment to any AWS account without modifications.
                  </p>
                </div>
              </div>

              {/* Architecture Blueprint Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Cpu className="w-4 h-4 text-teal-600" />
                    <span>Client Layer</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    React 19 + TypeScript SPA with Leaflet maps, instant local optimistic updates, and offline fallback caching.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Cloud className="w-4 h-4 text-teal-600" />
                    <span>AWS SAM Lambda</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    ARM64 Node.js 20 micro-functions routing through AWS HTTP API Gateway for low latency and zero cost when idle.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Database className="w-4 h-4 text-teal-600" />
                    <span>DynamoDB & S3</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Geospatial bounding-box partition keys with automated 48-hour TTL expiration for ephemeral flood incidents.
                  </p>
                </div>
              </div>

              {/* REST Endpoints Contract */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100/70 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-800">
                  Documented Backend REST Contract
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">GET</span>
                      <span className="text-slate-800 font-semibold">/api/v1/incidents?city=Mumbai</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">Returns active incidents filtered by zone</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">POST</span>
                      <span className="text-slate-800 font-semibold">/api/v1/reports</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">Submits new flood observation with photos</span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">POST</span>
                      <span className="text-slate-800 font-semibold">/api/v1/reports/:id/corroborate</span>
                    </div>
                    <span className="text-slate-500 text-[11px]">Increments confidence score via citizen vote</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'template' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  template.yaml (AWS SAM Infrastructure as Code)
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied YAML!' : 'Copy YAML'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto leading-relaxed border border-slate-800 max-h-[460px]">
                {SAM_TEMPLATE_YAML}
              </pre>
            </div>
          )}

          {activeTab === 'export_steps' && (
            <div className="space-y-5 text-xs text-slate-700">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">
                  How to Export and Run FloodLens Locally
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  You can export this codebase from Google AI Studio and run it in under 60 seconds on any machine with Node.js 18+.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 mb-0.5">Download Source Files</h5>
                    <p className="text-slate-600">
                      Export the project archive via the AI Studio interface menu or clone the connected GitHub repository.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 mb-0.5">Install Dependencies</h5>
                    <pre className="p-2 bg-slate-900 text-teal-300 font-mono text-[11px] rounded mt-1">
                      npm install
                    </pre>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 mb-0.5">Start Local Development Server</h5>
                    <pre className="p-2 bg-slate-900 text-teal-300 font-mono text-[11px] rounded mt-1">
                      npm run dev
                    </pre>
                    <p className="text-slate-500 mt-1">
                      Open <code className="text-teal-800 font-mono">http://localhost:3000</code> in your browser to interact with the interactive flood intelligence map.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <h5 className="font-bold text-slate-900 mb-0.5">Deploy AWS SAM Backend (Optional)</h5>
                    <pre className="p-2 bg-slate-900 text-teal-300 font-mono text-[11px] rounded mt-1">
                      sam build && sam deploy --guided
                    </pre>
                    <p className="text-slate-500 mt-1">
                      Set <code className="text-teal-800 font-mono">VITE_AWS_API_BASE_URL</code> in <code className="font-mono">.env</code> to point frontend requests directly to your live API Gateway!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            WeMakeDevs Bharat Builds Environmental Hacks
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
