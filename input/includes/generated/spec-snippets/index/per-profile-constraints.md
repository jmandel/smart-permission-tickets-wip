<table>
  <thead>
    <tr><th>Use Case</th><th><code>presenter_binding</code></th><th>Requester</th><th>Identity Evidence</th><th>Access Constraints</th></tr>
  </thead>
  <tbody>
  <tr><td><a href="patient-self-access.html">Patient Self Access</a></td><td>Required</td><td>—</td><td><code>subject_identity_evidence</code> SHOULD</td><td><code>smart_scopes</code> required; <code>data_period</code>, <code>data_holder_filter</code> optional</td></tr>
  <tr><td><a href="patient-delegated-access.html">Patient-Delegated Access</a></td><td>Required</td><td><code>RelatedPerson</code> (required)</td><td><code>subject_identity_evidence</code> SHOULD; <code>requester_identity_evidence</code> SHOULD</td><td><code>smart_scopes</code> required; <code>data_period</code>, <code>data_holder_filter</code> optional</td></tr>
  <tr><td><a href="payer-claims-adjudication.html">Payer Claims Adjudication</a></td><td>Optional</td><td><code>Organization</code> (required)</td><td>— (requester is an organization)</td><td><code>smart_scopes</code>, <code>claim_linkage</code> required</td></tr>
  <tr><td><a href="payer-quality-gap-queries.html">Payer Quality Gap Queries</a></td><td>Optional</td><td><code>Organization</code> (required)</td><td>— (requester is an organization)</td><td><code>smart_scopes</code> (every scope narrowed), <code>data_period</code> required</td></tr>
  </tbody>
</table>
