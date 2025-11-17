const ProductServicesContent = () => {
  return (
    <section className="bg-muted/50 py-16 md:py-20">
      <div className="container">
        <div className="grid gap-9 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <h1 className="text-balance text-4xl font-medium lg:text-5xl">
              Complete Compliance & Security Readiness
            </h1>
            <p className="text-muted-foreground text-lg">
              Stay compliant with privacy and healthcare regulations. Our
              platform meets GDPR and HIPAA requirements, providing data
              protection and compliance monitoring for regulated industries.
            </p>
          </div>
          <div className="border-border bg-background rounded-2xl border">
            <div className="grid divide-y divide-border">
            <div className="border-border relative overflow-hidden p-3 md:p-4 min-h-28 md:min-h-32 flex flex-col justify-center">
              <div>
                <h2 className="text-lg md:text-xl font-medium">
                  Automated audit trails
                </h2>
                <p className="text-muted-foreground mt-1 mb-0 text-sm md:text-base leading-relaxed">
                  Every action is logged and timestamped with immutable audit
                  trails for complete regulatory compliance.
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden p-3 md:p-4 min-h-28 md:min-h-32 flex flex-col justify-center">
              <div>
                <h2 className="text-lg md:text-xl font-medium">
                  Compliance monitoring
                </h2>
                <p className="text-muted-foreground mt-1 mb-0 text-sm md:text-base leading-relaxed">
                  Real-time monitoring ensures continuous compliance with
                  industry standards and regulations.
                </p>
              </div>
            </div>
            <div className="border-border relative overflow-hidden p-3 md:p-4 min-h-28 md:min-h-32 flex flex-col justify-center">
              <div>
                <h2 className="text-lg md:text-xl font-medium">
                  Regulatory reporting
                </h2>
                <p className="text-muted-foreground mt-1 mb-0 text-sm md:text-base leading-relaxed">
                  Generate compliance reports automatically to meet regulatory
                  requirements and audit demands.
                </p>
              </div>
            </div>
            <div className="border-border relative overflow-hidden p-3 md:p-4 min-h-28 md:min-h-32 flex flex-col justify-center">
              <div>
                <h2 className="text-lg md:text-xl font-medium">
                  Access controls
                </h2>
                <p className="text-muted-foreground mt-1 mb-0 text-sm md:text-base leading-relaxed">
                  Granular role-based access ensures secure data access management.
                </p>
              </div>
            </div>
            <div className="border-border relative overflow-hidden p-3 md:p-4 min-h-28 md:min-h-32 flex flex-col justify-center">
              <div>
                <h2 className="text-lg md:text-xl font-medium">
                  Incident response
                </h2>
                <p className="text-muted-foreground mt-1 mb-0 text-sm md:text-base leading-relaxed">
                  Defined procedures enable rapid detection and remediation of incidents.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { ProductServicesContent };
